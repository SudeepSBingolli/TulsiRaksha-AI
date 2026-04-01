# TulsiRaksha-AI Integration Architecture

## 🎯 Project Overview

This document describes the complete integration of **real-time smartwatch data** with the **TulsiRaksha-AI health prediction system**.

### **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    SMARTWATCH (FB BGR001)                    │
│                  (Heart Rate, Battery, Steps)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Bluetooth LE)
┌─────────────────────────────────────────────────────────────┐
│              API_BRIDGE (api_bridge.py)                      │
│  • SmartWatchDataSource: BLE Connection                      │
│  • HealthDataCache: Data Storage & Aggregation              │
│  • HealthPredictionEngine: ML Model Integration             │
│  • HealthDataBridge: Orchestration                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Python Objects)
┌─────────────────────────────────────────────────────────────┐
│         UNIFIED_API (unified_api.py)                        │
│                                                               │
│  Core Endpoints:                                            │
│  • /api/live-health          - Latest smartwatch data       │
│  • /api/predict-live         - Real-time predictions        │
│  • /api/health-history       - Data history                 │
│  • /api/predictions-history  - Prediction history           │
│  • /api/stats                - Health statistics            │
│  • /api/dashboard            - Complete dashboard           │
│  • /api/batch-predict        - Batch operations             │
│  • /api/bridge/*             - Bridge control               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (HTTP REST / JSON)
┌─────────────────────────────────────────────────────────────┐
│          FRONTEND (index.html + Dashboard)                  │
│                                                               │
│  • Real-time data display                                   │
│  • Live health metrics                                      │
│  • Risk predictions                                         │
│  • Historical analytics                                     │
│  • System statistics                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 File Structure

```
TulsiRaksha-AI/
├── api_bridge.py              # Core bridge layer
├── unified_api.py             # Flask API server
├── app.py                     # Original Flask app (unchanged)
├── model.pkl                  # Pre-trained ML model
├── index.html                 # Web frontend
├── requirements.txt           # Python dependencies
├── stream_heart_rate.py       # (Legacy) Direct smartwatch streamer
├── integrated_health_system.py # (Legacy) Integrated system
└── INTEGRATION_ARCHITECTURE.md # This file
```

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**

```bash
pip install flask flask-cors bleak joblib pandas requests
```

### **Step 2: Start the Unified API Server**

```bash
python unified_api.py
```

**Expected Output:**
```
============================================================
TulsiRaksha-AI Unified API Server
============================================================
Starting bridge...
Bridge started in background

API Documentation:
  • GET  /api                    - API information
  • GET  /api/health             - Health check
  • GET  /api/live-health        - Live health data
  • GET  /api/health-history     - Health history
  • POST /api/predict            - Predict health risk
  • GET  /api/predict-live       - Predict for live data
  • GET  /api/predictions-history- Prediction history
  • GET  /api/stats              - Health statistics
  • GET  /api/dashboard          - Complete dashboard
  • POST /api/batch-predict      - Batch predictions

============================================================
```

### **Step 3: Open the Frontend**

1. Open `index.html` in your web browser
2. Click **"▶ Start Streaming"** button
3. Watch real-time data flow in

---

## 🔧 Component Details

### **1. API Bridge (`api_bridge.py`)**

The bridge layer orchestrates all data flow between smartwatch and API.

#### **SmartWatchDataSource Class**

```python
class SmartWatchDataSource:
    DEVICE_ADDRESS = "14:EC:88:EF:8C:46"  # FB BGR001
    HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
    BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
```

**Key Methods:**
- `connect()`: Establish BLE connection
- `disconnect()`: Close connection
- `get_latest_data()`: Get current sensor readings

#### **HealthDataCache Class**

Stores and aggregates health data with statistics:
- Maintains last 1000 data points
- Calculates avg/min/max heart rate
- Tracks statistics in real-time

#### **HealthPredictionEngine Class**

Integration with ML model:
- Loads `model.pkl` on initialization
- Predicts risk level (LOW/NORMAL/HIGH)
- Caches predictions

#### **HealthDataBridge Class**

Main orchestrator:
```python
bridge = HealthDataBridge(use_mock=False)
bridge.start_async()  # Start in background thread

# Public API methods
bridge.get_live_health_data()      # Latest data
bridge.get_health_history(50)      # Last 50 records
bridge.get_health_stats()          # Statistics
bridge.predict_health_risk(data)   # Make prediction
bridge.get_predictions_history(20) # Prediction history
```

---

### **2. Unified API Server (`unified_api.py`)**

Flask application providing REST endpoints.

#### **Key Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api` | GET | API information |
| `/api/health` | GET | General health check |
| `/api/live-health` | GET | Latest real-time data |
| `/api/health-history` | GET | Historical data (query: limit) |
| `/api/predict` | POST | Predict with custom data |
| `/api/predict-live` | GET | Predict with live data |
| `/api/predictions-history` | GET | Prediction history |
| `/api/stats` | GET | Health statistics |
| `/api/dashboard` | GET | Complete dashboard data |
| `/api/batch-predict` | POST | Batch predictions |
| `/api/bridge/status` | GET | Bridge status |
| `/api/bridge/start` | POST | Start bridge |
| `/api/bridge/stop` | POST | Stop bridge |

#### **Response Format**

All responses follow consistent format:

**Success (200):**
```json
{
    "success": true,
    "message": "Success message",
    "data": { /* actual data */ },
    "timestamp": "2026-04-02T15:30:45.123456"
}
```

**Error (400/503):**
```json
{
    "success": false,
    "error": "Error code",
    "message": "Error description",
    "timestamp": "2026-04-02T15:30:45.123456"
}
```

---

### **3. Frontend Dashboard (`index.html`)**

Interactive web interface for monitoring.

#### **Features**

- **Live Stats Display**
  - Current heart rate
  - Current prediction
  
- **Control Buttons**
  - Start/Stop streaming
  - Refresh statistics
  - Clear data
  
- **Data Display**
  - Real-time data stream
  - Color-coded by risk level
  - Scrollable history
  
- **Statistics Dashboard**
  - LOW predictions count
  - NORMAL predictions count
  - HIGH predictions count
  
- **API Configuration**
  - Configurable endpoint URL
  - Connection status indicator
  - Auto-reconnection

#### **How It Works**

```javascript
// 1. Connect to API
fetch("http://127.0.0.1:5000/api/predict-live")

// 2. Retrieve data every 2 seconds
setInterval(fetchLiveData, 2000)

// 3. Display with color coding
// GREEN: LOW risk
// YELLOW: NORMAL risk
// RED: HIGH risk
```

---

## 📊 Data Format

### **Live Health Data**

```json
{
    "heart_rate": 78,
    "battery": 45,
    "steps": 2500,
    "timestamp": "2026-04-02T15:30:45.123456",
    "is_connected": true
}
```

### **Prediction Result**

```json
{
    "risk": "NORMAL",
    "confidence": 0.95,
    "timestamp": "2026-04-02T15:30:45.123456",
    "input": {
        "heart_rate": 78,
        "steps": 2500,
        "sleep": 7,
        "medicine": 1
    },
    "live_data": {
        "heart_rate": 78,
        "battery": 45,
        "steps": 2500,
        "timestamp": "2026-04-02T15:30:45.123456"
    }
}
```

### **Health Statistics**

```json
{
    "total_samples": 150,
    "avg_heart_rate": 75.5,
    "min_heart_rate": 65,
    "max_heart_rate": 95,
    "latest_timestamp": "2026-04-02T15:30:45.123456"
}
```

---

## 🔌 Configuration

### **Smartwatch Device Configuration**

Edit in `api_bridge.py`:

```python
class SmartWatchDataSource:
    DEVICE_ADDRESS = "14:EC:88:EF:8C:46"      # Your device Bluetooth address
    HEART_RATE_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
    BATTERY_UUID = "00002a19-0000-1000-8000-00805f9b34fb"
```

### **API Server Configuration**

Edit in `unified_api.py`:

```python
# Mock data mode (for testing without device)
bridge = HealthDataBridge(use_mock=True)

# Real device mode
bridge = HealthDataBridge(use_mock=False)

# Server configuration
app.run(
    host='0.0.0.0',      # Listen on all interfaces
    port=5000,           # API port
    debug=True,          # Debug mode
    use_reloader=False   # Important: disable reloader
)
```

### **Frontend Configuration**

In `index.html`, default API endpoint:

```html
<input type="text" id="apiEndpoint" 
    placeholder="http://127.0.0.1:5000" 
    value="http://127.0.0.1:5000">
```

---

## 🧪 Testing

### **Test 1: Check API Connectivity**

```bash
curl http://127.0.0.1:5000/api
```

Expected: API information response

### **Test 2: Get Live Health Data**

```bash
curl http://127.0.0.1:5000/api/live-health
```

Expected: Current smartwatch data

### **Test 3: Make Prediction**

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 78,
    "steps": 2500,
    "sleep": 7,
    "medicine": 1
  }'
```

Expected: Risk prediction (LOW/NORMAL/HIGH)

### **Test 4: Get Dashboard**

```bash
curl http://127.0.0.1:5000/api/dashboard
```

Expected: Complete dashboard with all data

---

## ⚙️ Integration Points

### **With Existing ML Model**

The system integrates with existing `model.pkl`:

```python
# HealthPredictionEngine loads the model
predictor = HealthPredictionEngine("model.pkl")

# Uses same feature set as training
features = {
    'heart_rate': 78,
    'steps': 2500,
    'sleep': 7,
    'medicine': 1
}

# Prediction API uses standard format
prediction = predictor.predict(features)
```

### **With Frontend Components**

Frontend calls API endpoints without modifying existing logic:

```javascript
// Replaces static data calls
const response = await fetch("/api/live-health")
const data = await response.json()

// Frontend receives and displays
document.getElementById('heartRate').textContent = data.data.heart_rate
```

### **With Authentication**

Currently no authentication required. To add:

```python
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not verify_token(token):
            return error_response("Unauthorized", status_code=401)
        return f(*args, **kwargs)
    return decorated

@app.route('/api/predict', methods=['POST'])
@require_auth
def predict():
    # Implementation
    pass
```

---

## 🔄 Background Processes

### **Data Collection Thread**

The bridge runs a background thread:

```python
def collect_data_loop():
    while bridge.is_running:
        # Get data from smartwatch
        data = smartwatch.get_latest_data()
        
        # Cache it
        cache.add_data(data)
        
        # Make prediction
        prediction = predictor.predict(data)
        
        # Wait 2 seconds
        await asyncio.sleep(2)
```

**Management:**
- Thread starts automatically when API starts
- Can be stopped/started via `/api/bridge/stop` and `/api/bridge/start`
- Runs in daemon mode (doesn't block server shutdown)

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to API"**

**Solution:**
1. Verify `unified_api.py` is running
2. Check endpoint URL is correct
3. Ensure port 5000 is not in use: `netstat -an | find ":5000"`

### **Issue: "Smartwatch not providing data"**

**Solution:**
1. Ensure smartwatch is powered on and paired
2. Check Bluetooth is enabled on computer
3. Verify device address: `14:EC:88:EF:8C:46`
4. Run diagnostic: `python find_smartwatch.py`

### **Issue: "Model not loaded"**

**Solution:**
1. Verify `model.pkl` exists in project directory
2. Ensure correct format (joblib pickle)
3. Check file permissions

### **Issue: Frontend shows "Disconnected"**

**Solution:**
1. Refresh page
2. Verify API endpoint in browser console
3. Check CORS is enabled (already configured)
4. Check browser network tab for errors

---

## 📈 Performance Considerations

### **Data Points Per Day**

With 2-second intervals:
- Data points/second: 0.5
- Data points/minute: 30
- Data points/hour: 1,800
- Data points/day: 43,200

### **Memory Usage**

With 1000-record cache:
- Per record: ~200 bytes
- Total cache: ~200 KB
- Predictions cache (100 records): ~100 KB
- **Total RAM: ~300 KB overhead**

### **Network Bandwidth**

Each data point response: ~300 bytes
- Per minute: 9 KB
- Per hour: 540 KB
- Per day: ~12 MB

---

## 🚀 Deployment

### **Local Deployment**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start server
python unified_api.py

# 3. Open frontend
# Open index.html in browser or serve via HTTP
python -m http.server 8000

# 4. Access at http://localhost:8000
```

### **Cloud Deployment (Vercel)**

See `VERCEL_DEPLOYMENT.md` for complete Vercel cloud setup.

### **Production Deployment**

```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 unified_api:app

# Using Waitress (Windows-friendly)
waitress-serve --port=5000 unified_api:app

# Using Docker
docker build -t tulsiraksha-ai .
docker run -p 5000:5000 tulsiraksha-ai
```

---

## 📝 Integration Checklist

- [x] API Bridge layer created
- [x] Smartwatch data source implemented
- [x] ML model integration complete
- [x] Health data caching implemented
- [x] REST API endpoints defined
- [x] Frontend UI updated
- [x] Real-time data streaming verified
- [x] Error handling implemented
- [x] CORS enabled
- [x] Documentation complete

---

## 🔗 Related Documentation

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Cloud deployment guide
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Legacy integration guide
- [README.md](README.md) - Project overview

---

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Review API response formats
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Last Updated:** April 2, 2026
**Status:** Production Ready ✅
