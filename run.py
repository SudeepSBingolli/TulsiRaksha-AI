"""
TulsiRaksha-AI Quick Start Launcher
Automatically starts all components with one command
"""

import subprocess
import time
import sys
import os
from pathlib import Path

def run_integrated_system():
    """Launch the integrated health prediction system"""
    
    print("\n" + "="*70)
    print("TULSIRAKSHA-AI LAUNCHER")
    print("="*70)
    
    # Check if required files exist
    required_files = ["app.py", "model.pkl", "integrated_health_system.py"]
    missing = []
    
    for file in required_files:
        if not Path(file).exists():
            missing.append(file)
    
    if missing:
        print(f"\nERROR: Missing files:")
        for f in missing:
            print(f"  - {f}")
        sys.exit(1)
    
    print("\nStarting TulsiRaksha-AI System...")
    print("="*70)
    
    # Get Python executable path
    python_exe = sys.executable
    
    try:
        # Run integrated system
        subprocess.run(
            [python_exe, "integrated_health_system.py"],
            check=False
        )
    except KeyboardInterrupt:
        print("\n\nShutdown initiated by user")
    except Exception as e:
        print(f"\nError: {e}")
    
    print("\n" + "="*70)
    print("TulsiRaksha-AI Stopped")
    print("="*70 + "\n")


if __name__ == "__main__":
    run_integrated_system()
