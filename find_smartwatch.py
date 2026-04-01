"""
Smartwatch Device Scanner and Pairing Helper
Scan for ALL Bluetooth devices and identify your smartwatch
"""

import asyncio
from bleak import BleakScanner, BleakClient
import requests
from datetime import datetime

class SmartWatchPairingHelper:
    def __init__(self):
        self.devices = []
        
    async def scan_all_devices(self, timeout=10):
        """Scan ALL Bluetooth devices (including unpaired)"""
        print(f"\n{'='*70}")
        print(f"🔍 SCANNING ALL BLUETOOTH DEVICES ({timeout}s)")
        print(f"{'='*70}")
        print("Make sure your smartwatch is:")
        print("  ✓ Powered ON")
        print("  ✓ Visible/Discoverable mode ON")
        print("  ✓ Close to this laptop\n")
        
        try:
            devices = await BleakScanner.discover(timeout=timeout)
            
            self.devices = sorted(
                devices,
                key=lambda x: getattr(x, 'rssi', 0) if getattr(x, 'rssi', None) else 0,
                reverse=True
            )
            
            print(f"{'='*70}")
            print(f"Found {len(self.devices)} Bluetooth devices:\n")
            
            for idx, device in enumerate(self.devices, 1):
                name = device.name or "< NO NAME >"
                signal = getattr(device, 'rssi', 0) or 0
                address = device.address
                
                # Signal strength indicator
                if signal >= -50:
                    bars = "📶📶📶 (Strong)"
                elif signal >= -70:
                    bars = "📶📶 (Good)"
                elif signal >= -90:
                    bars = "📶 (Weak)"
                else:
                    bars = "📶❌ (Very Weak)"
                
                print(f"[{idx}] {name}")
                print(f"     Address: {address}")
                print(f"     Signal:  {signal} dBm {bars}\n")
            
            return self.devices
            
        except Exception as e:
            print(f"❌ Scan error: {e}")
            return []
    
    async def connect_and_read(self, device_address, timeout=30):
        """Try to connect and read data from device"""
        try:
            print(f"\n🔌 Connecting to {device_address}...")
            client = BleakClient(device_address, timeout=timeout)
            
            async with client:
                print("✅ Connected!")
                
                # Get all services
                services = client.services
                print(f"\n📋 Available Services/Characteristics:")
                print(f"{'='*70}\n")
                
                health_chars = []
                
                for service in services:
                    print(f"Service: {service.uuid}")
                    
                    for char in service.characteristics:
                        desc = char.description or "Unknown"
                        can_read = "read" in char.properties
                        
                        if can_read:
                            try:
                                data = await client.read_gatt_char(char.uuid)
                                value = data.hex() if len(data) < 20 else data.hex()[:40] + "..."
                                print(f"  ✓ {desc} ({char.uuid})")
                                print(f"    Value: {value}")
                                
                                # Check if it's health-related
                                if any(x in desc.lower() for x in ['heart', 'step', 'activity', 'battery', 'sleep', 'stress']):
                                    health_chars.append({
                                        'name': desc,
                                        'uuid': char.uuid,
                                        'value': value
                                    })
                                
                            except Exception as e:
                                print(f"  ? {desc} ({char.uuid})")
                                print(f"    Error reading: {str(e)[:50]}")
                
                print(f"\n{'='*70}")
                if health_chars:
                    print(f"🏥 Health-related characteristics found:")
                    for hc in health_chars:
                        print(f"   - {hc['name']}: {hc['value']}")
                else:
                    print("ℹ️  No obvious health characteristics found")
                
                return True
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False


async def select_device(devices):
    """Let user select device"""
    if not devices:
        print("No devices to select from!")
        return None
    
    print(f"\n{'='*70}")
    print("📱 WHICH ONE IS YOUR SMARTWATCH?")
    print(f"{'='*70}\n")
    
    for idx, device in enumerate(devices, 1):
        name = device.name or "< NO NAME >"
        print(f"[{idx}] {name} - {device.address}")
    
    try:
        choice = int(input("\nEnter number: "))
        if 1 <= choice <= len(devices):
            return devices[choice - 1]
    except:
        pass
    
    return None


async def main():
    helper = SmartWatchPairingHelper()
    
    print("\n" + "="*70)
    print("🎯 SMARTWATCH DISCOVERY & DATA READER")
    print("="*70)
    
    # Scan devices
    devices = await helper.scan_all_devices(timeout=15)
    
    if not devices:
        print("❌ No devices found!")
        print("\nTroubleshooting:")
        print("  1. Make sure your smartwatch is ON")
        print("  2. Enable pairing/discoverable mode on your smartwatch")
        print("  3. Check it's visible in Windows Bluetooth settings")
        print("  4. Make sure it's NOT already connected to phone")
        return
    
    # Select device
    selected = await select_device(devices)
    
    if not selected:
        print("❌ Invalid selection")
        return
    
    print(f"\n🎯 Selected: {selected.name} ({selected.address})")
    
    # Try to connect and read
    await helper.connect_and_read(selected.address)
    
    print(f"\n{'='*70}")
    print("✅ Device identified!")
    print("="*70)
    print(f"\nIf this is your smartwatch, copy the ADDRESS and use it in:")
    print("smartwatch_ble_connector.py")


if __name__ == "__main__":
    asyncio.run(main())
