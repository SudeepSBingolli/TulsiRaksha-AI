"""
TulsiRaksha-AI: Real-time Health Prediction System
Integrated Script - Combines Flask API + Real Smartwatch Data Streaming
"""

import subprocess
import asyncio
import requests
import time
import threading
from datetime import datetime
from bleak import BleakClient
import json

class IntegratedHealthPredictor:
    """Main integrated system for real-time health predictions"""
    
    def __init__(self):
        self.device_address = "14:EC:88:EF:8C:46"  # FB BGR001
        self.api_url = "http://127.0.0.1:5000/predict"
        self.client = None
        
        self.heart_rate = 0
        self.steps = 0
        self.sleep = 7
        self.medicine = 1
        self.battery = 0
        self.data_count = 0
        self.predictions = []
        
        # UUIDs
        self.HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
        self.BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
    
    async def connect_smartwatch(self):
        """Connect to smartwatch"""
        try:
            print("\n[SMARTWATCH] Connecting to FB BGR001...")
            self.client = BleakClient(self.device_address, timeout=10)
            await self.client.connect()
            print("[SMARTWATCH] Connected!")
            return True
        except Exception as e:
            print(f"[SMARTWATCH] Connection failed: {e}")
            return False
    
    def heart_rate_callback(self, sender, data):
        """Handle heart rate notifications from smartwatch"""
        try:
            if len(data) >= 2:
                heart_rate = data[1]
                self.heart_rate = heart_rate
                
                # Read battery asynchronously
                asyncio.create_task(self.read_battery())
                
                # Get prediction
                prediction = self.predict()
                
                # Store and display
                if prediction:
                    self.predictions.append(prediction)
                    self.data_count += 1
                    self.display_prediction(prediction)
                
        except Exception as e:
            pass
    
    async def read_battery(self):
        """Read battery level"""
        try:
            if self.client and self.client.is_connected:
                data = await self.client.read_gatt_char(self.BATTERY_UUID)
                if len(data) > 0:
                    self.battery = int(data[0])
        except:
            pass
    
    def predict(self):
        """Send data to prediction API"""
        try:
            payload = {
                "heart_rate": self.heart_rate or 70,
                "steps": self.steps or 1000,
                "sleep": self.sleep,
                "medicine": self.medicine,
            }
            
            response = requests.post(self.api_url, json=payload, timeout=5)
            if response.status_code == 200:
                result = response.json()
                return {
                    "timestamp": datetime.now().isoformat(),
                    "heart_rate": self.heart_rate,
                    "battery": self.battery,
                    "prediction": result.get("risk"),
                }
        except:
            pass
        
        return None
    
    def display_prediction(self, prediction):
        """Display prediction result"""
        timestamp = prediction["timestamp"]
        hr = prediction["heart_rate"]
        risk = prediction["prediction"]
        batt = prediction["battery"]
        
        emoji = {"LOW": "[OK]", "NORMAL": "[!]", "HIGH": "[!!]"}.get(risk, "[-]")
        
        print(f"\n[Prediction #{self.data_count}] {timestamp}")
        print(f"  HR: {hr} bpm | Battery: {batt}% | Prediction: {emoji} {risk}")
    
    async def stream(self, duration=300):
        """Stream heart rate and make predictions"""
        try:
            print("\n[STREAM] Starting real-time data streaming...")
            await self.client.start_notify(self.HEART_RATE_UUID, self.heart_rate_callback)
            
            print("[STREAM] Listening for heart rate data...\n")
            print("="*70)
            print("REAL-TIME HEALTH PREDICTION STREAM")
            print("="*70 + "\n")
            
            await asyncio.sleep(duration)
            await self.client.stop_notify(self.HEART_RATE_UUID)
            
            print(f"\n{'='*70}")
            print(f"Streaming Complete! {self.data_count} predictions generated")
            print(f"{'='*70}")
            
        except Exception as e:
            print(f"[ERROR] {e}")
    
    async def disconnect(self):
        """Disconnect smartwatch"""
        if self.client:
            await self.client.disconnect()
            print("\n[SMARTWATCH] Disconnected")


def start_flask_server():
    """Start Flask API server in subprocess"""
    try:
        print("[API] Starting Flask prediction server...")
        subprocess.Popen(
            ["python", "app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(3)  # Wait for Flask to start
        print("[API] Flask server started on http://127.0.0.1:5000")
    except Exception as e:
        print(f"[API] Error starting Flask: {e}")


async def main():
    """Main integrated system"""
    
    print("\n" + "="*70)
    print("TULSIRAKSHA-AI: REAL-TIME HEALTH PREDICTION")
    print("="*70)
    print("\nIntegrated System Components:")
    print("  1. Flask API (Prediction Model)")
    print("  2. Smartwatch FB BGR001 (Real-time Data)")
    print("  3. Health Predictor (Model Inference)")
    
    # Start Flask server
    start_flask_server()
    
    # Connect to smartwatch and stream
    predictor = IntegratedHealthPredictor()
    
    try:
        if not await predictor.connect_smartwatch():
            print("\nPlease ensure:")
            print("  - Smartwatch is ON and paired")
            print("  - Smartwatch is in Bluetooth range")
            return
        
        # Stream for 5 minutes (300 seconds)
        await predictor.stream(duration=300)
        
        # Print summary
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        print(f"Total Predictions: {len(predictor.predictions)}")
        
        if predictor.predictions:
            risks = [p["prediction"] for p in predictor.predictions]
            low_count = risks.count("LOW")
            normal_count = risks.count("NORMAL")
            high_count = risks.count("HIGH")
            
            print(f"\nRisk Distribution:")
            print(f"  LOW:    {low_count} ({100*low_count/len(risks):.1f}%)")
            print(f"  NORMAL: {normal_count} ({100*normal_count/len(risks):.1f}%)")
            print(f"  HIGH:   {high_count} ({100*high_count/len(risks):.1f}%)")
            
            # Save results
            output_file = f"predictions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(output_file, 'w') as f:
                json.dump(predictor.predictions, f, indent=2)
            print(f"\nResults saved to: {output_file}")
        
        print("="*70 + "\n")
        
    except KeyboardInterrupt:
        print("\n[INFO] Stream stopped by user")
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        await predictor.disconnect()


if __name__ == "__main__":
    print("\nPrerequisites:")
    print("  [REQUIRED] Flask server running - python app.py")
    print("  [REQUIRED] Smartwatch FB BGR001 paired and ON")
    print("  [REQUIRED] Smartwatch within Bluetooth range\n")
    
    asyncio.run(main())
