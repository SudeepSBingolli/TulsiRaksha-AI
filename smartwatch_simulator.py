"""
Real-time Smartwatch Data Simulator
Simulates realistic smartwatch metrics and sends to prediction API
"""

import requests
import time
import random
import threading
from datetime import datetime
from collections import deque
import json

class SmartwatchSimulator:
    def __init__(self, api_url="http://127.0.0.1:5000/predict"):
        self.api_url = api_url
        self.running = False
        
        # Data buffers for averaging
        self.hr_buffer = deque(maxlen=10)
        self.steps_buffer = deque(maxlen=10)
        
        # Current state
        self.heart_rate = 70
        self.steps = 0
        self.sleep = 7
        self.medicine = 1
        self.stress_level = 50
        self.acceleration = 0
        self.calories = 0
        
        # Activity state
        self.is_active = False
        
    def _generate_heart_rate(self):
        """Generate realistic heart rate based on activity"""
        if self.is_active:
            # During activity: 100-150 bpm
            change = random.uniform(-2, 5)
            self.heart_rate += change
            self.heart_rate = max(100, min(150, self.heart_rate))
        else:
            # At rest: 60-80 bpm
            change = random.uniform(-1, 1)
            self.heart_rate += change
            self.heart_rate = max(60, min(80, self.heart_rate))
        
        return round(self.heart_rate, 1)
    
    def _generate_steps(self):
        """Generate realistic step count"""
        if self.is_active:
            step_increase = random.randint(5, 20)
            self.steps += step_increase
        else:
            # Minimal movement
            self.steps += random.randint(0, 2)
        
        return self.steps
    
    def _generate_stress_level(self):
        """Generate stress level (0-100)"""
        if self.is_active:
            change = random.uniform(-5, 3)
        else:
            change = random.uniform(-2, 2)
        
        self.stress_level += change
        self.stress_level = max(20, min(100, self.stress_level))
        return round(self.stress_level, 1)
    
    def _generate_acceleration(self):
        """Generate acceleration data (simulates movement intensity)"""
        if self.is_active:
            acc = random.uniform(0.5, 3.0)
        else:
            acc = random.uniform(0, 0.5)
        
        self.acceleration = acc
        return round(acc, 2)
    
    def _generate_calories(self):
        """Generate calories burned estimation"""
        if self.is_active:
            cal_burn = random.uniform(2, 8)
            self.calories += cal_burn
        else:
            cal_burn = random.uniform(0.5, 1)
            self.calories += cal_burn
        
        return round(self.calories, 1)
    
    def get_real_time_data(self):
        """Get current smartwatch data"""
        return {
            "timestamp": datetime.now().isoformat(),
            "heart_rate": self._generate_heart_rate(),
            "steps": self._generate_steps(),
            "stress_level": self._generate_stress_level(),
            "acceleration": self._generate_acceleration(),
            "calories_burned": self._generate_calories(),
            "sleep": self.sleep,
            "medicine": self.medicine,
            "is_active": self.is_active,
        }
    
    def send_prediction_request(self, data):
        """Send data to prediction API"""
        try:
            # Prepare minimal data for API
            payload = {
                "heart_rate": data["heart_rate"],
                "steps": data["steps"],
                "sleep": data["sleep"],
                "medicine": data["medicine"],
            }
            
            response = requests.post(self.api_url, json=payload, timeout=5)
            
            if response.status_code == 200:
                prediction = response.json()
                return {
                    "status": "success",
                    "prediction": prediction,
                    "data": data
                }
            else:
                return {
                    "status": "error",
                    "error": f"API returned {response.status_code}",
                    "data": data
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "data": data
            }
    
    def simulate_activity_patterns(self):
        """Simulate realistic daily activity patterns"""
        # Random activity every 10-30 seconds
        if random.random() < 0.3:  # 30% chance to start activity
            self.is_active = True
        elif random.random() < 0.2:  # 20% chance to stop activity
            self.is_active = False
    
    def run_stream(self, duration_seconds=300, interval_seconds=2):
        """
        Run real-time data stream for specified duration
        
        Args:
            duration_seconds: How long to stream (default 5 minutes)
            interval_seconds: Interval between data points (default 2 seconds)
        """
        self.running = True
        start_time = time.time()
        data_count = 0
        
        print(f"\n{'='*70}")
        print(f"🏃 SMARTWATCH DATA STREAM - Real-time Simulator")
        print(f"{'='*70}")
        print(f"Duration: {duration_seconds} seconds | Interval: {interval_seconds}s")
        print(f"API Endpoint: {self.api_url}")
        print(f"Start Time: {datetime.now().isoformat()}\n")
        
        while time.time() - start_time < duration_seconds and self.running:
            try:
                # Generate realistic data
                self.simulate_activity_patterns()
                data = self.get_real_time_data()
                
                # Send to API for prediction
                result = self.send_prediction_request(data)
                
                # Display result
                self._display_data(result, data_count)
                data_count += 1
                
                time.sleep(interval_seconds)
                
            except KeyboardInterrupt:
                print("\n\n⏹️  Stream stopped by user")
                self.running = False
                break
            except Exception as e:
                print(f"Error: {e}")
        
        self._print_summary(data_count)
    
    def _display_data(self, result, count):
        """Display formatted data"""
        data = result.get("data", {})
        
        print(f"\n[Data Point #{count+1}] {data.get('timestamp', 'N/A')}")
        print(f"  Heart Rate:      {data.get('heart_rate', 'N/A')} bpm")
        print(f"  Steps:           {data.get('steps', 'N/A')}")
        print(f"  Stress Level:    {data.get('stress_level', 'N/A')}%")
        print(f"  Acceleration:    {data.get('acceleration', 'N/A')} m/s²")
        print(f"  Calories:        {data.get('calories_burned', 'N/A')} kcal")
        print(f"  Activity:        {'🏃 Active' if data.get('is_active') else '😴 Resting'}")
        
        if result.get("status") == "success":
            prediction = result.get("prediction", {})
            risk = prediction.get("risk", "UNKNOWN")
            risk_emoji = {
                "LOW": "🟢",
                "NORMAL": "🟡",
                "HIGH": "🔴"
            }.get(risk, "⚪")
            print(f"  ⚕️  PREDICTION:   {risk_emoji} {risk} RISK")
        else:
            print(f"  ⚠️  Error: {result.get('error', 'Unknown error')}")
    
    def _print_summary(self, count):
        """Print summary statistics"""
        print(f"\n{'='*70}")
        print(f"✅ Stream Complete!")
        print(f"{'='*70}")
        print(f"Total Data Points: {count}")
        print(f"Final Steps: {self.steps}")
        print(f"Total Calories: {round(self.calories, 1)} kcal")
        print(f"Final Heart Rate: {round(self.heart_rate, 1)} bpm")
        print(f"End Time: {datetime.now().isoformat()}")
        print(f"{'='*70}\n")


def main():
    """Main entry point"""
    print("\n🚀 Starting Smartwatch Simulator...")
    print("Make sure Flask server is running on http://127.0.0.1:5000")
    print("(Run: python app.py in another terminal)\n")
    
    input("Press ENTER to start streaming real-time data...")
    
    # Create simulator
    simulator = SmartwatchSimulator()
    
    # Run stream (5 minutes with 2-second intervals)
    # Modify parameters as needed:
    # duration_seconds: total time to stream
    # interval_seconds: delay between data points
    simulator.run_stream(duration_seconds=300, interval_seconds=2)


if __name__ == "__main__":
    main()
