"""
Local Smartwatch Data Sender
Connects to smartwatch locally and sends data to Vercel API
"""

import asyncio
import requests
from datetime import datetime
from bleak import BleakClient

class SmartWatchToVercelSender:
    """Send real smartwatch data to Vercel"""
    
    def __init__(self, device_address="14:EC:88:EF:8C:46", api_endpoint="http://localhost:5000"):
        """
        Args:
            device_address: FB BGR001 Bluetooth address
            api_endpoint: Vercel API endpoint (or local for testing)
                Example: "https://your-project.vercel.app" 
                         "http://127.0.0.1:5000" (local)
        """
        self.device_address = device_address
        self.api_endpoint = api_endpoint
        self.client = None
        
        self.HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
        self.BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
        
        self.heart_rate = 0
        self.battery = 0
        self.data_count = 0
        
        # Smartwatch data
        self.steps = 1000
        self.sleep = 7
        self.medicine = 1
    
    async def connect(self):
        """Connect to smartwatch"""
        try:
            print(f"Connecting to {self.device_address}...")
            self.client = BleakClient(self.device_address, timeout=10)
            await self.client.connect()
            print("Connected!")
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
    
    def heart_rate_callback(self, sender, data):
        """Handle heart rate notifications"""
        try:
            if len(data) >= 2:
                self.heart_rate = data[1]
                
                # Send to Vercel
                asyncio.create_task(self.send_to_api())
                
        except Exception as e:
            pass
    
    async def read_battery(self):
        """Read battery"""
        try:
            if self.client and self.client.is_connected:
                data = await self.client.read_gatt_char(self.BATTERY_UUID)
                if len(data) > 0:
                    self.battery = int(data[0])
        except:
            pass
    
    async def send_to_api(self):
        """Send data to API"""
        try:
            # Read battery
            await self.read_battery()
            
            # Prepare payload
            payload = {
                "heart_rate": self.heart_rate or 70,
                "steps": self.steps,
                "sleep": self.sleep,
                "medicine": self.medicine,
            }
            
            # Send to API
            response = requests.post(
                f"{self.api_endpoint}/predict",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                self.data_count += 1
                self.display(result)
            
        except Exception as e:
            print(f"Send error: {e}")
    
    def display(self, result):
        """Display result"""
        timestamp = result.get("timestamp", "?")
        hr = result.get("heart_rate", 0)
        risk = result.get("risk", "?")
        
        emoji = {"LOW": "[OK]", "NORMAL": "[!]", "HIGH": "[!!]"}.get(risk, "[-]")
        
        print(f"\n[{self.data_count}] {timestamp}")
        print(f"    HR: {hr} bpm | Battery: {self.battery}% | API: {emoji} {risk}")
    
    async def stream(self, duration=300):
        """Stream data"""
        try:
            print(f"\nStreaming to: {self.api_endpoint}/predict")
            print("Subscribing to heart rate...\n")
            
            await self.client.start_notify(
                self.HEART_RATE_UUID, 
                self.heart_rate_callback
            )
            
            print("="*70)
            print("SMARTWATCH -> VERCEL DATA STREAM")
            print("="*70 + "\n")
            
            await asyncio.sleep(duration)
            
            await self.client.stop_notify(self.HEART_RATE_UUID)
            
            print(f"\n{'='*70}")
            print(f"Complete! {self.data_count} data points sent")
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
    print("SMARTWATCH -> VERCEL DATA SENDER")
    print("="*70)
    
    # For local testing use: http://127.0.0.1:5000
    # For Vercel deployment use: https://your-project.vercel.app
    API_ENDPOINT = "http://127.0.0.1:5000"
    
    print(f"\nAPI Endpoint: {API_ENDPOINT}")
    print("Sending smartwatch data to API...\n")
    
    sender = SmartWatchToVercelSender(api_endpoint=API_ENDPOINT)
    
    try:
        if not await sender.connect():
            return
        
        # Stream for 5 minutes
        await sender.stream(duration=300)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await sender.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
