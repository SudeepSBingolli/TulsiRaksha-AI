"""  
FB BGR001 Real-time Heart Rate Streamer
Uses Bluetooth notifications to get live heart rate data
"""

import asyncio
import requests
from datetime import datetime
from bleak import BleakClient
import time

class HeartRateNotificationStreamer:
    """Stream heart rate via Bluetooth notifications"""
    
    def __init__(self, device_address="14:EC:88:EF:8C:46", api_url="http://127.0.0.1:5000/predict"):
        self.device_address = device_address
        self.api_url = api_url
        self.client = None
        
        # Heart rate service UUIDs
        self.HEART_RATE_CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
        self.BATTERY_CHAR_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
        
        self.heart_rate = 0
        self.steps = 0
        self.sleep = 7
        self.medicine = 1
        self.battery = 0
        self.data_count = 0
    
    async def connect(self):
        """Connect to smartwatch"""
        try:
            print("Connecting to FB BGR001...")
            self.client = BleakClient(self.device_address, timeout=10)
            await self.client.connect()
            print("Connected!\n")
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
    
    def heart_rate_callback(self, sender, data):
        """Callback when heart rate data is received"""
        try:
            # Parse heart rate from notification
            # Format: [flags, heart_rate]
            if len(data) >= 2:
                flags = data[0]
                heart_rate = data[1]
                
                self.heart_rate = heart_rate
                self.data_count += 1
                
                # Also get battery
                asyncio.create_task(self.read_battery())
                
                # Send prediction
                prediction = self.send_to_api()
                
                # Display
                self.display_data(prediction)
                
        except Exception as e:
            print(f"Error parsing heart rate: {e}")
    
    async def read_battery(self):
        """Read battery level"""
        try:
            if self.client and self.client.is_connected:
                data = await self.client.read_gatt_char(self.BATTERY_CHAR_UUID)
                if len(data) > 0:
                    self.battery = int(data[0])
        except:
            pass
    
    def send_to_api(self):
        """Send to prediction API"""
        try:
            payload = {
                "heart_rate": self.heart_rate or 70,
                "steps": self.steps or 1000,
                "sleep": self.sleep,
                "medicine": self.medicine,
            }
            
            response = requests.post(self.api_url, json=payload, timeout=5)
            if response.status_code == 200:
                return response.json()
        except:
            pass
        
        return None
    
    def display_data(self, prediction):
        """Display formatted data"""
        timestamp = datetime.now().isoformat()
        
        print(f"\n[Data #{self.data_count}] {timestamp}")
        print(f"  Heart Rate: {self.heart_rate} bpm")
        print(f"  Battery:    {self.battery}%")
        print(f"  Sleep:      {self.sleep} hrs")
        print(f"  Medicine:   {self.medicine}")
        
        if prediction:
            risk = prediction.get("risk", "?")
            emoji = {"LOW": "[OK]", "NORMAL": "[!]", "HIGH": "[!!]"}.get(risk, "[-]")
            print(f"  Prediction: {emoji} {risk} RISK")
    
    async def stream(self, duration=300):
        """Subscribe to notifications and stream"""
        try:
            print("Subscribing to heart rate notifications...")
            await self.client.start_notify(self.HEART_RATE_CHAR_UUID, self.heart_rate_callback)
            print("Listening for heart rate data...\n")
            
            print("="*70)
            print("REAL-TIME HEART RATE STREAM - FB BGR001")
            print("="*70 + "\n")
            
            # Wait for the specified duration
            await asyncio.sleep(duration)
            
            # Unsubscribe
            await self.client.stop_notify(self.HEART_RATE_CHAR_UUID)
            
            print(f"\n{'='*70}")
            print(f"Stream Complete! {self.data_count} heart rate readings collected")
            print(f"{'='*70}\n")
            
        except Exception as e:
            print(f"Error: {e}")
    
    async def disconnect(self):
        """Disconnect"""
        if self.client:
            await self.client.disconnect()
            print("Disconnected")


async def main():
    print("\n" + "="*70)
    print("FB BGR001 REAL-TIME HEART RATE STREAMER")
    print("="*70)
    print("\nMake sure:")
    print("  - Smartwatch is ON and paired")
    print("  - Flask server running (python app.py)")
    print("  - Smartwatch within Bluetooth range\n")
    
    streamer = HeartRateNotificationStreamer()
    
    try:
        if not await streamer.connect():
            return
        
        # Stream for 5 minutes
        await streamer.stream(duration=300)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await streamer.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
