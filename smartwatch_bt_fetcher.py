"""
Real Smartwatch Data Fetcher via Bluetooth (Gadgetbridge Protocol Compatible)
Fetches actual health metrics from connected smartwatch and sends to prediction API
"""

import asyncio
import requests
import json
from datetime import datetime
from bleak import BleakClient, BleakScanner
import struct
import time

class GadgetbridgeBLEDataFetcher:
    """Fetch real smartwatch data via Bluetooth"""
    
    # Common UUIDs for health metrics
    HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
    STEP_COUNT_UUID = "00002a33-0000-1000-8000-00805f9b34fb"
    BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
    
    def __init__(self, api_url="http://127.0.0.1:5000/predict"):
        self.api_url = api_url
        self.client = None
        self.device = None
        
        # Real data buffers
        self.heart_rate = 0
        self.steps = 0
        self.sleep = 7
        self.medicine = 1
        self.stress_level = 50
        self.acceleration = 0
        self.calories = 0
        
    async def scan_devices(self):
        """Scan and list available Bluetooth devices"""
        print("\n📡 Scanning for Bluetooth devices...")
        devices = await BleakScanner.discover()
        
        smartwatches = []
        for device in devices:
            name = device.name or "Unknown"
            # Filter for common smartwatch names
            if any(x in name.lower() for x in ['mi band', 'amazfit', 'pebble', 'garmin', 'fitbit', 'honor', 'huawei']):
                smartwatches.append((device, name))
                print(f"  ✓ {name} ({device.address})")
        
        if not smartwatches:
            print("  ⚠️  No smartwatches found. Available devices:")
            for device in devices[:5]:
                print(f"     - {device.name or 'Unknown'} ({device.address})")
        
        return smartwatches
    
    async def connect(self, device_address):
        """Connect to smartwatch via Bluetooth"""
        try:
            print(f"\n🔌 Connecting to {device_address}...")
            self.client = BleakClient(device_address)
            await self.client.connect()
            print("✅ Connected!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def read_heart_rate(self):
        """Read heart rate from smartwatch"""
        try:
            if not self.client or not self.client.is_connected:
                return None
            
            # Try to read from Heart Rate characteristic
            services = await self.client.get_services()
            for service in services:
                for char in service.characteristics:
                    if "heart" in char.description.lower() or char.uuid == self.HEART_RATE_UUID:
                        try:
                            data = await self.client.read_gatt_char(char.uuid)
                            # Parse heart rate (format varies by device)
                            if len(data) >= 2:
                                self.heart_rate = data[1] if data[0] & 0x01 else struct.unpack('<H', data[1:3])[0]
                                return self.heart_rate
                        except:
                            pass
        except Exception as e:
            print(f"Heart rate read error: {e}")
        
        return None
    
    async def read_steps(self):
        """Read step count from smartwatch"""
        try:
            if not self.client or not self.client.is_connected:
                return None
            
            services = await self.client.get_services()
            for service in services:
                for char in service.characteristics:
                    if "step" in char.description.lower():
                        try:
                            data = await self.client.read_gatt_char(char.uuid)
                            if len(data) >= 4:
                                self.steps = struct.unpack('<I', data[:4])[0]
                                return self.steps
                        except:
                            pass
        except Exception as e:
            print(f"Steps read error: {e}")
        
        return None
    
    async def read_battery(self):
        """Read battery level"""
        try:
            if not self.client or not self.client.is_connected:
                return None
            
            services = await self.client.get_services()
            for service in services:
                for char in service.characteristics:
                    if "battery" in char.description.lower() or char.uuid == self.BATTERY_UUID:
                        try:
                            data = await self.client.read_gatt_char(char.uuid)
                            if len(data) >= 1:
                                return data[0]
                        except:
                            pass
        except Exception as e:
            pass
        
        return None
    
    async def fetch_all_metrics(self):
        """Fetch all available metrics from smartwatch"""
        metrics = {
            "timestamp": datetime.now().isoformat(),
        }
        
        # Read available metrics
        hr = await self.read_heart_rate()
        if hr:
            metrics["heart_rate"] = hr
        
        steps = await self.read_steps()
        if steps:
            metrics["steps"] = steps
        
        battery = await self.read_battery()
        if battery:
            metrics["battery"] = battery
        
        # Add other metrics
        metrics["sleep"] = self.sleep
        metrics["medicine"] = self.medicine
        
        return metrics
    
    def send_prediction(self, data):
        """Send metrics to prediction API"""
        try:
            payload = {
                "heart_rate": data.get("heart_rate", self.heart_rate),
                "steps": data.get("steps", self.steps),
                "sleep": data.get("sleep", self.sleep),
                "medicine": data.get("medicine", self.medicine),
            }
            
            # Ensure valid values
            if payload["heart_rate"] == 0 or payload["steps"] == 0:
                return None
            
            response = requests.post(self.api_url, json=payload, timeout=5)
            
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Prediction request error: {e}")
        
        return None
    
    async def stream_real_data(self, duration=300, interval=5):
        """Stream real smartwatch data"""
        print(f"\n{'='*70}")
        print(f"📊 REAL SMARTWATCH DATA STREAM")
        print(f"{'='*70}")
        print(f"Duration: {duration}s | Interval: {interval}s\n")
        
        start_time = time.time()
        data_count = 0
        
        while time.time() - start_time < duration:
            try:
                # Fetch metrics from smartwatch
                metrics = await self.fetch_all_metrics()
                
                if not metrics or ("heart_rate" not in metrics and "steps" not in metrics):
                    print(f"⚠️  No data available from device. Retrying...")
                    await asyncio.sleep(2)
                    continue
                
                # Send to prediction API
                prediction = self.send_prediction(metrics)
                
                # Display results
                self._display_data(metrics, prediction, data_count)
                data_count += 1
                
                await asyncio.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stream stopped")
                break
            except Exception as e:
                print(f"Stream error: {e}")
                await asyncio.sleep(2)
        
        print(f"\n{'='*70}")
        print(f"✅ Stream Complete! {data_count} data points collected")
        print(f"{'='*70}\n")
    
    def _display_data(self, metrics, prediction, count):
        """Display data in formatted table"""
        print(f"\n[Data #{count+1}] {metrics.get('timestamp', 'N/A')}")
        print(f"  Heart Rate:  {metrics.get('heart_rate', 'N/A')} bpm")
        print(f"  Steps:       {metrics.get('steps', 'N/A')}")
        print(f"  Battery:     {metrics.get('battery', 'N/A')}%")
        
        if prediction:
            risk = prediction.get("risk", "UNKNOWN")
            emoji = {"LOW": "🟢", "NORMAL": "🟡", "HIGH": "🔴"}.get(risk, "⚪")
            print(f"  Prediction:  {emoji} {risk} RISK")
        else:
            print(f"  Prediction:  ⏳ Processing...")
    
    async def disconnect(self):
        """Disconnect from device"""
        if self.client:
            await self.client.disconnect()
            print("\n🔌 Disconnected")


async def main():
    """Main entry point"""
    fetcher = GadgetbridgeBLEDataFetcher()
    
    print("\n🚀 Real Smartwatch Data Fetcher (Gadgetbridge Compatible)")
    print("Make sure Flask server is running: python app.py\n")
    
    try:
        # Scan for devices
        devices = await fetcher.scan_devices()
        
        if not devices:
            print("\n❌ No smartwatches found!")
            print("Make sure your smartwatch is:")
            print("  1. Powered on and in pairing mode")
            print("  2. Within Bluetooth range")
            print("  3. Already paired with this computer")
            return
        
        # Connect to first device
        device, name = devices[0]
        print(f"\n🎯 Connecting to: {name}")
        
        if not await fetcher.connect(device.address):
            return
        
        # Stream data
        await fetcher.stream_real_data(duration=300, interval=5)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await fetcher.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
