"""
Smartwatch Diagnostic Tool - FB BGR001
Probe all available data and find heart rate characteristic
"""

import asyncio
from bleak import BleakClient
import struct

async def diagnose_smartwatch():
    """Diagnose and list all available data from FB BGR001"""
    
    DEVICE_ADDRESS = "14:EC:88:EF:8C:46"
    
    print("\n" + "="*70)
    print("FB BGR001 SMARTWATCH DIAGNOSTIC")
    print("="*70 + "\n")
    
    try:
        print("Connecting to " + DEVICE_ADDRESS + "...")
        client = BleakClient(DEVICE_ADDRESS, timeout=15)
        
        async with client:
            print("✅ Connected!\n")
            
            services = client.services
            services_list = [s for s in services]
            print(f"📋 Total Services: {len(services_list)}\n")
            
            all_data = {}
            readable_chars = 0
            
            for service_idx, service in enumerate(services_list, 1):
                print(f"[Service {service_idx}] {service.uuid}")
                
                for char in service.characteristics:
                    uuid = char.uuid
                    desc = char.description or "Unknown"
                    props = char.properties
                    
                    can_read = "read" in props
                    can_notify = "notify" in props
                    can_indicate = "indicate" in props
                    
                    # Try to read if possible
                    value_str = ""
                    if can_read:
                        try:
                            data = await client.read_gatt_char(uuid)
                            readable_chars += 1
                            value_str = f" → Value: {data.hex()}"
                            all_data[desc] = {
                                'uuid': uuid,
                                'data': data,
                                'hex': data.hex()
                            }
                            
                            # Try to parse common formats
                            if "heart" in desc.lower():
                                hr = data[1] if len(data) > 1 else data[0]
                                value_str += f" (HR: {hr} bpm)"
                            elif "step" in desc.lower():
                                steps = struct.unpack('<I', data[:4])[0] if len(data) >= 4 else int(data[0])
                                value_str += f" (Steps: {steps})"
                            elif "battery" in desc.lower():
                                battery = int(data[0]) if len(data) > 0 else 0
                                value_str += f" (Battery: {battery}%)"
                                
                        except Exception as e:
                            value_str = f" → Error reading: {str(e)[:40]}"
                    
                    # Print characteristic info
                    print(f"  {desc}")
                    print(f"    UUID: {uuid}")
                    print(f"    Properties: {', '.join(props)}")
                    if value_str:
                        print(f"    {value_str}")
                    print()
            
            # Summary
            print(f"\n{'='*70}")
            print("📊 SUMMARY")
            print(f"{'='*70}")
            print(f"Total readable characteristics: {readable_chars}\n")
            
            # Find health metrics
            print("🏥 Health Metrics Found:")
            health_found = False
            for desc, data_info in all_data.items():
                if any(x in desc.lower() for x in ['heart', 'step', 'battery', 'activity', 'sleep', 'stress', 'calories']):
                    print(f"  ✓ {desc}")
                    print(f"    UUID: {data_info['uuid']}")
                    print(f"    Hex Data: {data_info['hex']}")
                    health_found = True
            
            if not health_found:
                print("  ⚠️  No obvious health metrics found")
                print("\nAll readable characteristics:")
                for desc in all_data.keys():
                    print(f"  - {desc}")
            
            return all_data
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("  1. Smartwatch is ON and paired")
        print("  2. No other apps are using the smartwatch")
        print("  3. Smartwatch is in range")
        return None

if __name__ == "__main__":
    asyncio.run(diagnose_smartwatch())
