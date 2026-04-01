"""
Realtime bridge for TulsiRaksha-AI.

Collects smartwatch data via BLE (Gadgetbridge-compatible), appends labeled rows
into the training dataset, retrains periodically, and hot-reloads the Flask model.
"""

import argparse
import asyncio
import csv
import os
import subprocess
import sys
import time
from datetime import datetime

import requests

from smartwatch_bt_fetcher import GadgetbridgeBLEDataFetcher
from train_model import train_model


def infer_risk(heart_rate, steps, sleep, medicine):
    if heart_rate > 110 and steps < 2500 and sleep < 5.5:
        return "HIGH"
    if heart_rate >= 105 and (steps < 3000 or sleep < 5):
        return "HIGH"

    if 58 <= heart_rate <= 92 and steps >= 4500 and sleep >= 7 and medicine == 1:
        return "LOW"
    if heart_rate < 60 and steps >= 5000 and sleep >= 7:
        return "LOW"

    return "NORMAL"


class RealtimeTrainingBridge:
    def __init__(
        self,
        dataset_path,
        model_path,
        api_base_url,
        sleep_hours,
        medicine,
        retrain_every,
        min_train_rows,
        start_api,
    ):
        self.dataset_path = dataset_path
        self.model_path = model_path
        self.api_base_url = api_base_url.rstrip("/")
        self.predict_url = f"{self.api_base_url}/predict"
        self.reload_url = f"{self.api_base_url}/reload-model"
        self.sleep_hours = float(sleep_hours)
        self.medicine = int(medicine)
        self.retrain_every = int(retrain_every)
        self.min_train_rows = int(min_train_rows)
        self.start_api = start_api

        self.fetcher = GadgetbridgeBLEDataFetcher(api_url=self.predict_url)
        self.api_process = None
        self.samples_since_retrain = 0
        self.last_valid_heart_rate = 72

    def _ensure_dataset(self):
        file_exists = os.path.exists(self.dataset_path)
        if not file_exists:
            with open(self.dataset_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["heart_rate", "steps", "sleep", "medicine", "risk", "timestamp"])

    def _dataset_rows(self):
        if not os.path.exists(self.dataset_path):
            return 0
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            row_count = sum(1 for _ in f)
        return max(0, row_count - 1)

    def _append_row(self, heart_rate, steps, sleep, medicine, risk):
        with open(self.dataset_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([heart_rate, steps, sleep, medicine, risk, datetime.now().isoformat()])

    def _predict_live(self, payload):
        try:
            response = requests.post(self.predict_url, json=payload, timeout=5)
            if response.status_code == 200:
                return response.json().get("risk", "UNKNOWN")
        except Exception:
            return "UNAVAILABLE"
        return "UNAVAILABLE"

    def _reload_model(self):
        try:
            response = requests.post(self.reload_url, timeout=8)
            return response.status_code == 200
        except Exception:
            return False

    def _maybe_retrain(self):
        total_rows = self._dataset_rows()
        if self.samples_since_retrain < self.retrain_every:
            return
        if total_rows < self.min_train_rows:
            return

        print("\n[TRAIN] Retraining model from realtime dataset...")
        try:
            train_model(data_path=self.dataset_path, model_path=self.model_path)
            reloaded = self._reload_model()
            if reloaded:
                print("[TRAIN] Model retrained and API model reloaded")
            else:
                print("[TRAIN] Model retrained, but API reload endpoint was not reachable")
            self.samples_since_retrain = 0
        except Exception as exc:
            print(f"[TRAIN] Retraining failed: {exc}")

    def _start_api_if_needed(self):
        if not self.start_api:
            return

        print("[API] Starting Flask prediction API in background...")
        self.api_process = subprocess.Popen([sys.executable, "app.py"])
        time.sleep(2)

    async def _connect(self, device_address):
        if device_address:
            return await self.fetcher.connect(device_address)

        devices = await self.fetcher.scan_devices()
        if not devices:
            print("[BLE] No supported smartwatch found.")
            return False

        for device, name in devices:
            print(f"[BLE] Trying device: {name} ({device.address})")
            if await self.fetcher.connect(device.address):
                print(f"[BLE] Connected to device: {name} ({device.address})")
                return True

        print("[BLE] Could not connect to any scanned BLE devices.")
        return False

    async def run(self, duration_seconds, interval_seconds, device_address):
        self._ensure_dataset()
        self._start_api_if_needed()

        connected = await self._connect(device_address)
        if not connected:
            return

        print("\n============================================================")
        print("Realtime Smartwatch -> Dataset -> Retrain -> Predict Bridge")
        print("============================================================")
        print(f"Dataset: {self.dataset_path}")
        print(f"Model:   {self.model_path}")
        print(f"API:     {self.api_base_url}")
        print(f"Duration: {duration_seconds}s, Interval: {interval_seconds}s")

        start = time.time()
        collected = 0
        try:
            while time.time() - start < duration_seconds:
                metrics = await self.fetcher.fetch_all_metrics()

                heart_rate = int(metrics.get("heart_rate") or 0)
                steps = int(metrics.get("steps") or 0)
                battery = int(metrics.get("battery") or 0)

                if heart_rate > 0:
                    self.last_valid_heart_rate = heart_rate
                else:
                    # Keep pipeline alive while waiting for first HR notification.
                    heart_rate = self.last_valid_heart_rate
                    if battery > 0:
                        print("[BLE] Waiting for live HR notify, using fallback HR for now")

                # If there is no sign of device metrics yet, wait and retry.
                if heart_rate <= 0 and steps <= 0 and battery <= 0:
                    await asyncio.sleep(interval_seconds)
                    continue

                payload = {
                    "heart_rate": heart_rate,
                    "steps": steps,
                    "sleep": self.sleep_hours,
                    "medicine": self.medicine,
                }

                pseudo_risk = infer_risk(
                    payload["heart_rate"],
                    payload["steps"],
                    payload["sleep"],
                    payload["medicine"],
                )
                self._append_row(
                    payload["heart_rate"],
                    payload["steps"],
                    payload["sleep"],
                    payload["medicine"],
                    pseudo_risk,
                )

                api_risk = self._predict_live(payload)
                collected += 1
                self.samples_since_retrain += 1

                print(
                    f"[#{collected}] HR={heart_rate} Steps={steps} Batt={battery}% "
                    f"Label={pseudo_risk} API={api_risk}"
                )

                self._maybe_retrain()
                await asyncio.sleep(interval_seconds)

        except KeyboardInterrupt:
            print("\n[STOP] Interrupted by user")
        finally:
            await self.fetcher.disconnect()
            if self.api_process:
                self.api_process.terminate()
            print(f"\n[DONE] Collected {collected} realtime samples")


def main():
    parser = argparse.ArgumentParser(description="Realtime training bridge for TulsiRaksha-AI")
    parser.add_argument("--duration", type=int, default=600, help="Collection duration in seconds")
    parser.add_argument("--interval", type=int, default=5, help="Collection interval in seconds")
    parser.add_argument("--device", default=None, help="BLE device address (optional)")
    parser.add_argument("--dataset", default="health_data.csv", help="Training CSV path")
    parser.add_argument("--model", default="model.pkl", help="Model output path")
    parser.add_argument("--api", default="http://127.0.0.1:5000", help="Prediction API base URL")
    parser.add_argument("--sleep", type=float, default=7.0, help="Sleep hours feature")
    parser.add_argument("--medicine", type=int, default=1, help="Medicine adherence feature (0/1)")
    parser.add_argument("--retrain-every", type=int, default=20, help="Retrain after N new samples")
    parser.add_argument("--min-train-rows", type=int, default=40, help="Minimum rows needed to retrain")
    parser.add_argument(
        "--start-api",
        action="store_true",
        help="Start app.py automatically before streaming",
    )
    args = parser.parse_args()

    bridge = RealtimeTrainingBridge(
        dataset_path=args.dataset,
        model_path=args.model,
        api_base_url=args.api,
        sleep_hours=args.sleep,
        medicine=args.medicine,
        retrain_every=args.retrain_every,
        min_train_rows=args.min_train_rows,
        start_api=args.start_api,
    )

    asyncio.run(
        bridge.run(
            duration_seconds=args.duration,
            interval_seconds=args.interval,
            device_address=args.device,
        )
    )


if __name__ == "__main__":
    main()
