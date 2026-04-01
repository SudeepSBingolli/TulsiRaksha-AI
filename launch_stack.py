"""
One-command stack launcher for TulsiRaksha-AI.

Starts:
1) Next.js frontend
2) Flask prediction API
3) Realtime smartwatch training bridge
"""

import argparse
import os
import signal
import subprocess
import sys
import time
from pathlib import Path

import requests


def _npm_command():
    if os.name == "nt":
        return ["npm.cmd"]
    return ["npm"]


def _spawn(command, name):
    process = subprocess.Popen(command)
    print(f"[STARTED] {name} (pid={process.pid})")
    return process


def _is_http_up(url, timeout=1.0):
    try:
        response = requests.get(url, timeout=timeout)
        return response.status_code < 500
    except Exception:
        return False


def _terminate(process, name):
    if process is None:
        return
    if process.poll() is not None:
        return

    print(f"[STOPPING] {name}...")
    try:
        if os.name == "nt":
            process.terminate()
        else:
            process.send_signal(signal.SIGTERM)
        process.wait(timeout=8)
    except Exception:
        process.kill()


def _verify_files():
    required = [
        "package.json",
        "app.py",
        "realtime_training_bridge.py",
    ]
    missing = [path for path in required if not Path(path).exists()]
    if missing:
        raise FileNotFoundError(f"Missing required files: {', '.join(missing)}")


def main():
    parser = argparse.ArgumentParser(description="Launch frontend + API + realtime bridge")
    parser.add_argument("--device", default=None, help="Smartwatch BLE address (optional)")
    parser.add_argument("--duration", type=int, default=1200, help="Bridge duration in seconds")
    parser.add_argument("--interval", type=int, default=5, help="Bridge sampling interval in seconds")
    parser.add_argument("--retrain-every", type=int, default=20, help="Retrain every N samples")
    args = parser.parse_args()

    _verify_files()

    frontend_cmd = _npm_command() + ["run", "dev"]
    api_cmd = [sys.executable, "app.py"]

    bridge_cmd = [
        sys.executable,
        "realtime_training_bridge.py",
        "--duration",
        str(args.duration),
        "--interval",
        str(args.interval),
        "--retrain-every",
        str(args.retrain_every),
    ]
    if args.device:
        bridge_cmd += ["--device", args.device]

    processes = []
    reused_services = []
    try:
        print("\nLaunching TulsiRaksha-AI full stack...\n")
        # Reuse an existing Next.js server if already up (common during iterative runs).
        if _is_http_up("http://127.0.0.1:3000") or _is_http_up("http://127.0.0.1:3001"):
            print("[REUSE] Existing Next.js frontend detected on port 3000/3001")
            reused_services.append("Next.js frontend")
        else:
            processes.append((_spawn(frontend_cmd, "Next.js frontend"), "Next.js frontend"))
            time.sleep(3)

        # Reuse existing Flask API if already running on port 5000.
        if _is_http_up("http://127.0.0.1:5000"):
            print("[REUSE] Existing Flask API detected on port 5000")
            reused_services.append("Flask API")
        else:
            processes.append((_spawn(api_cmd, "Flask API"), "Flask API"))
            time.sleep(2)

        processes.append((_spawn(bridge_cmd, "Realtime bridge"), "Realtime bridge"))

        print("\nRunning. Press Ctrl+C to stop all services.\n")
        while True:
            for proc, name in processes:
                exit_code = proc.poll()
                if exit_code is not None:
                    # If bridge exits, end launcher. Other exits can be tolerated when reused mode is active.
                    if name == "Realtime bridge":
                        print(f"[EXIT] {name} exited with code {exit_code}")
                        raise SystemExit(exit_code)
                    print(f"[WARN] {name} exited with code {exit_code}; continuing")
                    processes = [(p, n) for p, n in processes if p != proc]
                    break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutdown requested by user.")
    finally:
        for proc, name in reversed(processes):
            _terminate(proc, name)
        print("All services stopped.")


if __name__ == "__main__":
    main()
