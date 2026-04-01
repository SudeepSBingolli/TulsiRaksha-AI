"""
API Bridge Layer - Connects Smartwatch Data Source to TulsiRaksha-AI
Extracts real-time data from GADGETBRIDGE_MT863/smartwatch
and provides clean API endpoints for the frontend
"""

import asyncio
import json
import time
from datetime import datetime
from threading import Thread, Lock
from collections import deque
from typing import Dict, List, Optional
import os
import sys

try:
    from bleak import BleakClient
except ImportError:
    print("Warning: bleak not installed. Using mock data mode.")
    BleakClient = None

# ============================================================================
# SMARTWATCH DATA SOURCE
# ============================================================================

class SmartWatchDataSource:
    """
    Connects to smartwatch via Bluetooth and streams health data
    Supports FB BGR001 and similar BLE health trackers
    """
    
    # FB BGR001 Smartwatch specifications
    DEVICE_ADDRESS = "14:EC:88:EF:8C:46"  # FB BGR001 address
    HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
    BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
    
    def __init__(self, use_mock: bool = False):
        """
        Initialize smartwatch data source
        
        Args:
            use_mock: If True, generates mock data instead of connecting to device
        """
        self.use_mock = use_mock
        self.is_connected = False
        self.client = None
        self.latest_data = {
            "heart_rate": 0,
            "battery": 0,
            "steps": 0,
            "timestamp": None
        }
        self.data_lock = Lock()
        self.last_heart_rate = 70
        
    def _parse_heart_rate(self, data: bytes) -> int:
        """Parse heart rate from BLE characteristic value"""
        if len(data) > 1:
            return int(data[1])
        return int(data[0]) if data else 0
    
    async def heart_rate_callback(self, sender, data):
        """Callback for heart rate notifications"""
        hr = self._parse_heart_rate(data)
        with self.data_lock:
            self.latest_data["heart_rate"] = hr
            self.latest_data["timestamp"] = datetime.now().isoformat()
            self.last_heart_rate = hr
    
    async def get_battery(self):
        """Read battery level from smartwatch"""
        try:
            if self.client and self.is_connected:
                battery_data = await self.client.read_gatt_char(self.BATTERY_UUID)
                return battery_data[0] if battery_data else 0
        except Exception as e:
            print(f"Error reading battery: {e}")
        return 0
    
    async def connect(self) -> bool:
        """Connect to smartwatch"""
        if self.use_mock:
            self.is_connected = True
            return True
        
        try:
            self.client = BleakClient(self.DEVICE_ADDRESS)
            await self.client.connect()
            self.is_connected = True
            
            # Subscribe to heart rate notifications
            await self.client.start_notify(
                self.HEART_RATE_UUID,
                self.heart_rate_callback
            )
            
            print(f"✓ Connected to smartwatch: {self.DEVICE_ADDRESS}")
            return True
        except Exception as e:
            print(f"✗ Failed to connect: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from smartwatch"""
        if self.client and self.is_connected:
            try:
                await self.client.stop_notify(self.HEART_RATE_UUID)
                await self.client.disconnect()
                self.is_connected = False
                print("✓ Disconnected from smartwatch")
            except Exception as e:
                print(f"Error disconnecting: {e}")
    
    def _generate_mock_data(self):
        """Generate realistic mock health data"""
        import random
        base_hr = 70 + random.randint(-10, 30)
        variation = random.randint(-5, 5)
        return {
            "heart_rate": base_hr + variation,
            "battery": random.randint(30, 100),
            "steps": random.randint(1000, 5000),
            "timestamp": datetime.now().isoformat()
        }
    
    def get_latest_data(self) -> Dict:
        """Get latest smartwatch data"""
        with self.data_lock:
            if self.use_mock:
                return self._generate_mock_data()
            return self.latest_data.copy()


# ============================================================================
# DATA CACHE & AGGREGATOR
# ============================================================================

class HealthDataCache:
    """
    Caches and aggregates health data from smartwatch
    Maintains history for statistics and analysis
    """
    
    def __init__(self, max_size: int = 1000):
        """
        Initialize cache
        
        Args:
            max_size: Maximum number of records to keep
        """
        self.data_queue = deque(maxlen=max_size)
        self.lock = Lock()
        self.stats = {
            "total_samples": 0,
            "avg_heart_rate": 0,
            "min_heart_rate": float('inf'),
            "max_heart_rate": 0,
            "latest_timestamp": None
        }
    
    def add_data(self, data: Dict):
        """Add data point to cache"""
        with self.lock:
            self.data_queue.append(data)
            self._update_stats(data)
    
    def _update_stats(self, data: Dict):
        """Update statistics"""
        if "heart_rate" in data and data["heart_rate"] > 0:
            hr = data["heart_rate"]
            
            self.stats["total_samples"] += 1
            self.stats["min_heart_rate"] = min(self.stats["min_heart_rate"], hr)
            self.stats["max_heart_rate"] = max(self.stats["max_heart_rate"], hr)
            
            # Calculate rolling average
            if self.data_queue:
                hrs = [d.get("heart_rate", 0) for d in self.data_queue if d.get("heart_rate", 0) > 0]
                self.stats["avg_heart_rate"] = sum(hrs) / len(hrs) if hrs else 0
            
            self.stats["latest_timestamp"] = data.get("timestamp")
    
    def get_all(self) -> List[Dict]:
        """Get all cached data"""
        with self.lock:
            return list(self.data_queue)
    
    def get_latest(self, count: int = 10) -> List[Dict]:
        """Get latest N records"""
        with self.lock:
            return list(list(self.data_queue)[-count:])
    
    def get_stats(self) -> Dict:
        """Get statistics"""
        with self.lock:
            return self.stats.copy()


# ============================================================================
# ML PREDICTION ENGINE
# ============================================================================

class HealthPredictionEngine:
    """
    Integrates with existing TulsiRaksha-AI ML model
    Provides health risk predictions based on real-time data
    """
    
    def __init__(self, model_path: str = "model.pkl"):
        """
        Initialize prediction engine
        
        Args:
            model_path: Path to trained joblib model
        """
        self.model_path = model_path
        self.model = None
        self.load_model()
        self.predictions_cache = deque(maxlen=100)
        self.lock = Lock()
    
    def load_model(self):
        """Load ML model from file"""
        try:
            import joblib
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"✓ Loaded ML model: {self.model_path}")
            else:
                print(f"✗ Model file not found: {self.model_path}")
        except ImportError:
            print("Warning: joblib not installed")
        except Exception as e:
            print(f"Error loading model: {e}")
    
    def predict(self, health_data: Dict) -> Dict:
        """
        Make health risk prediction
        
        Args:
            health_data: Dictionary with health metrics
            
        Returns:
            Prediction result with risk level and confidence
        """
        if not self.model:
            return {
                "risk": "UNKNOWN",
                "confidence": 0,
                "error": "Model not loaded"
            }
        
        try:
            import pandas as pd
            
            # Extract features (same format as training data)
            features = pd.DataFrame([{
                'heart_rate': health_data.get('heart_rate', 70),
                'steps': health_data.get('steps', 1000),
                'sleep': health_data.get('sleep', 7),
                'medicine': health_data.get('medicine', 1)
            }])
            
            # Make prediction
            prediction = self.model.predict(features)[0]
            
            # Cache prediction
            result = {
                "risk": str(prediction),
                "confidence": 0.95,
                "timestamp": datetime.now().isoformat(),
                "input": health_data
            }
            
            with self.lock:
                self.predictions_cache.append(result)
            
            return result
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                "risk": "ERROR",
                "confidence": 0,
                "error": str(e)
            }
    
    def get_predictions(self, count: int = 10) -> List[Dict]:
        """Get cached predictions"""
        with self.lock:
            return list(list(self.predictions_cache)[-count:])


# ============================================================================
# MAIN API BRIDGE
# ============================================================================

class HealthDataBridge:
    """
    Main bridge connecting smartwatch data to TulsiRaksha-AI
    Orchestrates data flow and provides unified API
    """
    
    def __init__(self, use_mock: bool = False):
        """
        Initialize the bridge
        
        Args:
            use_mock: Use mock data if True
        """
        self.smartwatch = SmartWatchDataSource(use_mock=use_mock)
        self.cache = HealthDataCache()
        self.predictor = HealthPredictionEngine()
        
        self.is_running = False
        self.collector_thread = None
    
    async def start(self):
        """Start data collection from smartwatch"""
        print("Starting Health Data Bridge...")
        
        # Connect to smartwatch
        if await self.smartwatch.connect():
            self.is_running = True
            print("✓ Bridge started successfully")
            return True
        else:
            print("✗ Failed to start bridge")
            return False
    
    async def stop(self):
        """Stop data collection"""
        self.is_running = False
        await self.smartwatch.disconnect()
        print("Bridge stopped")
    
    def collect_data_loop(self):
        """Background thread for collecting smartwatch data"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def run():
            await self.start()
            
            while self.is_running:
                # Get latest data from smartwatch
                data = self.smartwatch.get_latest_data()
                
                if data.get("heart_rate", 0) > 0:
                    # Add to cache
                    self.cache.add_data(data)
                    
                    # Make prediction
                    prediction = self.predictor.predict({
                        "heart_rate": data.get("heart_rate"),
                        "steps": data.get("steps", 1000),
                        "sleep": 7,
                        "medicine": 1
                    })
                    
                    print(f"[Data] HR: {data['heart_rate']} bpm | Prediction: {prediction['risk']}")
                
                await asyncio.sleep(2)  # Collect every 2 seconds
        
        try:
            loop.run_until_complete(run())
        except KeyboardInterrupt:
            loop.run_until_complete(self.stop())
        finally:
            loop.close()
    
    def start_async(self):
        """Start bridge in background thread"""
        self.collector_thread = Thread(target=self.collect_data_loop, daemon=True)
        self.collector_thread.start()
    
    # ========================================================================
    # PUBLIC API METHODS
    # ========================================================================
    
    def get_live_health_data(self) -> Dict:
        """Get latest health data"""
        data = self.smartwatch.get_latest_data()
        return {
            "heart_rate": data.get("heart_rate", 0),
            "battery": data.get("battery", 0),
            "steps": data.get("steps", 0),
            "timestamp": data.get("timestamp"),
            "is_connected": self.smartwatch.is_connected
        }
    
    def get_health_history(self, limit: int = 50) -> List[Dict]:
        """Get health data history"""
        return self.cache.get_latest(limit)
    
    def get_health_stats(self) -> Dict:
        """Get health statistics"""
        return self.cache.get_stats()
    
    def predict_health_risk(self, data: Dict) -> Dict:
        """Predict health risk for given data"""
        return self.predictor.predict(data)
    
    def get_predictions_history(self, limit: int = 20) -> List[Dict]:
        """Get prediction history"""
        return self.predictor.get_predictions(limit)
    
    def get_status(self) -> Dict:
        """Get bridge status"""
        return {
            "is_running": self.is_running,
            "smartwatch_connected": self.smartwatch.is_connected,
            "total_samples": self.cache.stats["total_samples"],
            "model_loaded": self.predictor.model is not None
        }


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    import asyncio
    
    # Create bridge with mock data for testing
    bridge = HealthDataBridge(use_mock=True)
    
    # Start bridge in background
    bridge.start_async()
    
    # Give it time to collect data
    time.sleep(5)
    
    # Test API methods
    print("\n=== Live Health Data ===")
    print(json.dumps(bridge.get_live_health_data(), indent=2))
    
    print("\n=== Health History ===")
    print(json.dumps(bridge.get_health_history(5), indent=2))
    
    print("\n=== Health Stats ===")
    print(json.dumps(bridge.get_health_stats(), indent=2))
    
    print("\n=== Bridge Status ===")
    print(json.dumps(bridge.get_status(), indent=2))
