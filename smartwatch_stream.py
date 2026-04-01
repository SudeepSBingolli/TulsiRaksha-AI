"""
Real-time Smartwatch Data Streamer - FB BGR001
Connects to smartwatch and streams live health metrics to prediction API
"""

import asyncio
import requests
import json
from datetime import datetime
from bleak import BleakClient
import time

class FBBGRSmartWatchStreamer:
    """Connect to FB BGR001 and stream health data"""
    
    # Common health metric UUIDs
    CHARACTERISTICS = {
        "heart_rate": ["00002a37-0000-1000-8000-00805f9b34fb"],
        "step_count": ["00002a33-0000-1000-8000-00805f9b34fb"],
        "battery": ["00002a19-0000-1000-8000-00805f9b34fb"],
        "activity": ["00002a3c-0000-1000-8000-00805f9b34fb"],
    }
    
    def __init__(self, device_address="14:EC:88:EF:8C:46", api_url="http://127.0.0.1:5000/predict"):
        self.device_address = device_address
        self.api_url = api_url
        self.client = None
        self.running = False
        
        # Data storage
        self.heart_rate = 0
        self.steps = 0
        self.sleep = 7.0
        self.medicine = 1
        self.battery = 0
        self.activity = 0
    
    async def connect(self):
        """Connect to smartwatch"""
        try:
            print(f"\n🔌 Connecting to FB BGR001 ({self.device_address})...")
            self.client = BleakClient(self.device_address, timeout=10)
            await self.client.connect()
            print("✅ Connected!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("\nTroubleshooting:")
            print("  1. Make sure smartwatch is ON and visible")
            print("  2. Check if it's paired in Windows Bluetooth settings")
            print("  3. Try disconnecting other apps using the smartwatch")
            return False
    
    async def discover_characteristics(self):
        """Discover available characteristics on device"""
        try:
            print("\n📋 Discovering device characteristics...")
            services = self.client.services
            
            found_health_chars = {}
            
            for service in services:
                for char in service.characteristics:
                    desc = char.description or ""
                    uuid = char.uuid
                    can_read = "read" in char.properties
                    
                    # Check for health metrics
                    if can_read:
                        if "heart" in desc.lower():
                            found_health_chars["heart_rate"] = uuid
                            print(f"   ✓ Heart Rate: {uuid}")
                        elif "step" in desc.lower():
                            found_health_chars["steps"] = uuid
                            print(f"   ✓ Step Count: {uuid}")
                        elif "battery" in desc.lower():
                            found_health_chars["battery"] = uuid
                            print(f"   ✓ Battery: {uuid}")
                        elif "activity" in desc.lower():
                            found_health_chars["activity"] = uuid
                            print(f"   ✓ Activity: {uuid}")
            
            if found_health_chars:
                print(f"\n✅ Found {len(found_health_chars)} health characteristics")
            else:
                print("⚠️  No standard health characteristics found")
            
            return found_health_chars
            
        except Exception as e:
            print(f"Error discovering characteristics: {e}")
            return {}
    
    async def read_metric(self, uuid, metric_name=""):
        """Read metric from device"""
        try:
            if not self.client or not self.client.is_connected:
                return None
            
            data = await self.client.read_gatt_char(uuid)
            
            # Parse based on characteristic
            if "heart" in metric_name.lower():
                # Heart rate format: first byte is flags, second byte is heart rate
                value = data[1] if len(data) > 1 else data[0]
                self.heart_rate = int(value)
                return self.heart_rate
                
            elif "step" in metric_name.lower():
                # Step count is typically 4-byte little endian
                value = int.from_bytes(data[:4], byteorder='little') if len(data) >= 4 else int(data[0])
                self.steps = int(value)
                return self.steps
                
            elif "battery" in metric_name.lower():
                # Battery is typically single byte percentage
                self.battery = int(data[0]) if len(data) > 0 else 0
                return self.battery
                
            elif "activity" in metric_name.lower():
                self.activity = int(data[0]) if len(data) > 0 else 0
                return self.activity
            
            return None
            
        except Exception as e:
            return None
    
    async def fetch_live_data(self, health_chars):
        """Fetch available live data"""
        data = {
            "timestamp": datetime.now().isoformat(),
        }
        
        # Read each available characteristic
        for metric, uuid in health_chars.items():
            value = await self.read_metric(uuid, metric)
            if value is not None:
                data[metric] = value
        
        # Add fixed values
        data["sleep"] = self.sleep
        data["medicine"] = self.medicine
        
        return data
    
    def send_to_api(self, live_data):
        """Send data to prediction API"""
        try:
            payload = {
                "heart_rate": live_data.get("heart_rate", self.heart_rate or 70),
                "steps": live_data.get("steps", self.steps or 0),
                "sleep": live_data.get("sleep", self.sleep),
                "medicine": live_data.get("medicine", self.medicine),
            }
            
            response = requests.post(self.api_url, json=payload, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            return None
    
    async def stream_data(self, duration=300, interval=3):
        """Stream live data for specified duration"""
        self.running = True
        
        # Discover health characteristics
        health_chars = await self.discover_characteristics()
        
        if not health_chars:
            print("⚠️  Warning: Could not find health characteristics")
            print("    Will attempt to read common UUIDs anyway...")
            health_chars = {
                "heart_rate": "00002a37-0000-1000-8000-00805f9b34fb",
                "steps": "00002a33-0000-1000-8000-00805f9b34fb",
            }
        
        print(f"\n{'='*70}")
        print(f"📊 REAL-TIME SMARTWATCH DATA STREAM (FB BGR001)")
        print(f"{'='*70}")
        print(f"Duration: {duration}s | Interval: {interval}s")
        print(f"Streaming to: {self.api_url}\n")
        
        start_time = time.time()
        data_count = 0
        
        while time.time() - start_time < duration and self.running:
            try:
                # Fetch live data
                live_data = await self.fetch_live_data(health_chars)
                
                # Send to prediction API
                prediction = self.send_to_api(live_data)
                
                # Display
                self._display_data(live_data, prediction, data_count)
                data_count += 1
                
                await asyncio.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n\n⏹️  Stream stopped by user")
                self.running = False
                break
            except Exception as e:
                print(f"Stream error: {e}")
                await asyncio.sleep(2)
        
        print(f"\n{'='*70}")
        print(f"✅ Streaming Complete! {data_count} data points collected")
        print(f"{'='*70}\n")
    
    def _display_data(self, live_data, prediction, count):
        """Display formatted data"""
        print(f"\n[Data Point #{count+1}] {live_data.get('timestamp', 'N/A')}")
        
        if live_data.get("heart_rate"):
            print(f"  ❤️  Heart Rate:     {live_data.get('heart_rate')} bpm")
        
        if live_data.get("steps"):
            print(f"  👟 Steps:          {live_data.get('steps')}")
        
        if live_data.get("battery"):
            print(f"  🔋 Battery:        {live_data.get('battery')}%")
        
        print(f"  😴 Sleep:          {live_data.get('sleep')} hrs")
        print(f"  💊 Medicine:       {live_data.get('medicine')}")
        
        if prediction:
            risk = prediction.get("risk", "UNKNOWN")
            emoji = {"LOW": "🟢", "NORMAL": "🟡", "HIGH": "🔴"}.get(risk, "⚪")
            print(f"  ⚕️  PREDICTION:     {emoji} {risk} RISK")
        else:
            print(f"  ⚠️  Prediction:     Error sending to API")
    
    async def disconnect(self):
        """Disconnect from device"""
        if self.client:
            await self.client.disconnect()
            print("\n🔌 Disconnected")


async def main():
    """Main entry point"""
    
    print(f"\n{'='*70}")
    print("⌚ FB BGR001 SMARTWATCH DATA STREAMER")
    print(f"{'='*70}")
    print("\nMake sure:")
    print("  ✓ Smartwatch is ON and paired")
    print("  ✓ Flask server is running: python app.py")
    print("  ✓ Smartwatch is within Bluetooth range\n")
    
    # Device address for FB BGR001
    DEVICE_ADDRESS = "14:EC:88:EF:8C:46"
    
    streamer = FBBGRSmartWatchStreamer(device_address=DEVICE_ADDRESS)
    
    try:
        # Connect
        if not await streamer.connect():
            return
        
        # Stream data (5 minutes, update every 3 seconds)
        await streamer.stream_data(duration=300, interval=3)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await streamer.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
