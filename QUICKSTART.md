# Quick Start Guide - TulsiRaksha-AI Real-Time Health Monitoring

## 🎯 What You're Getting

A complete real-time health monitoring system that:
- Connects to your smartwatch via Bluetooth
- Streams live health data (heart rate, battery, steps)
- Makes AI-powered risk predictions
- Displays everything on a beautiful web dashboard

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Install Python Dependencies**

```bash
pip install flask flask-cors bleak joblib pandas requests
```

### **Step 2: Run the API Server**

```bash
python unified_api.py
```

**Watch for this output:**
```
============================================================
TulsiRaksha-AI Unified API Server
============================================================
Starting bridge...
============================================================
```

### **Step 3: Open the Dashboard**

Open `index.html` in your web browser, then click **"▶ Start Streaming"**

---

## 📊 What You'll See

```
╔════════════════════════════════════════╗
║    ❤️  TulsiRaksha-AI                  ║
║  Real-Time Health Prediction System    ║
╠════════════════════════════════════════╣
║                                        ║
║  Heart Rate: 78 bpm                   ║
║  Prediction: NORMAL RISK               ║
║                                        ║
║  [▶ Start] [⏹ Stop] [🔄 Refresh]      ║
║                                        ║
║  ─────────────────────────────────────  ║
║  [Data #1] 15:30:45                   ║
║    HR: 78 bpm | Battery: 45%          ║
║    ✓ Prediction: NORMAL RISK           ║
║                                        ║
║  [Data #2] 15:30:47                   ║
║    HR: 76 bpm | Battery: 45%          ║
║    ✓ Prediction: NORMAL RISK           ║
║  ─────────────────────────────────────  ║
║                                        ║
║  LOW: 0  |  NORMAL: 2  |  HIGH: 0     ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🔧 Testing Without Smartwatch

Want to test without connecting a real device? Use mock data:

**In `unified_api.py`, change:**
```python
bridge = HealthDataBridge(use_mock=False)
```

**To:**
```python
bridge = HealthDataBridge(use_mock=True)
```

Now run: `python unified_api.py` - it will generate realistic fake data!

---

## 🌐 API Endpoints

| Endpoint | What It Does |
|----------|-------------|
| `GET /api/live-health` | Get current heart rate |
| `GET /api/predict-live` | Predict risk for current data |
| `GET /api/health-history` | Get past 50 data points |
| `GET /api/stats` | Get health statistics |
| `GET /api/dashboard` | Get everything at once |
| `POST /api/predict` | Custom prediction |

**Example:**
```bash
curl http://127.0.0.1:5000/api/live-health
```

Response:
```json
{
    "success": true,
    "data": {
        "heart_rate": 78,
        "battery": 45,
        "steps": 2500,
        "timestamp": "2026-04-02T15:30:45.123456",
        "is_connected": true
    }
}
```

---

## 📱 Dashboard Controls

| Button | Function |
|--------|----------|
| ▶ **Start Streaming** | Begin collecting smartwatch data |
| ⏹ **Stop** | Stop data collection |
| 🔄 **Refresh Stats** | Update statistics |
| 🗑 **Clear Data** | Delete all history |

---

## 🎨 Understanding the Colors

| Color | Meaning | Heart Rate |
|-------|---------|-----------|
| 🟢 **GREEN** | LOW risk | < 60 bpm |
| 🟡 **YELLOW** | NORMAL risk | 60-100 bpm |
| 🔴 **RED** | HIGH risk | > 100 bpm |

---

## 📊 What Gets Predicted

The system analyzes:
- **Heart Rate** (real-time from smartwatch)
- **Steps** (activity level)
- **Sleep** (assumed 7 hours)
- **Medicine** (adherence)

**Output:** Risk Level (LOW / NORMAL / HIGH)

---

## 🔌 Integration Details

### **Architecture**

```
Smartwatch → Bluetooth → Python Bridge → Flask API → Web Dashboard
```

### **Key Files**

| File | Purpose |
|------|---------|
| `unified_api.py` | Main API server (run this!) |
| `api_bridge.py` | Smartwatch connection logic |
| `index.html` | Web dashboard |
| `model.pkl` | ML prediction model |

---

## ✅ Checklist Before Starting

- [ ] Python 3.7+ installed
- [ ] Dependencies installed: `pip install flask flask-cors bleak joblib pandas requests`
- [ ] Smartwatch is powered on
- [ ] Smartwatch is paired with computer
- [ ] Bluetooth is enabled on computer
- [ ] Port 5000 is available (not in use)

---

## 🚨 Common Issues & Fixes

### ❌ "Cannot connect to API"
✅ **Fix:** Make sure `python unified_api.py` is running in another terminal

### ❌ "Smartwatch not providing data"
✅ **Fix:** 
1. Turn smartwatch off/on
2. Re-pair smartwatch
3. Run in mock mode for testing

### ❌ "Port 5000 already in use"
✅ **Fix:** 
```bash
# Kill process using port 5000 (Windows)
netstat -ano | find ":5000"
taskkill /PID <PID> /F

# Or change port in unified_api.py
app.run(port=5001)
```

### ❌ "Model not loaded"
✅ **Fix:** Verify `model.pkl` exists in project folder

---

## 📈 Next Steps

1. **Local Testing**
   - Run API server
   - Open dashboard
   - Start streaming
   - Verify data flows

2. **Cloud Deployment** (Optional)
   - See VERCEL_DEPLOYMENT.md
   - Deploy to Vercel
   - Access from anywhere

3. **Customization**
   - Modify prediction thresholds
   - Add more metrics
   - Create alerts

---

## 🔗 File Locations

- **API Server:** `unified_api.py`
- **Bridge:** `api_bridge.py`
- **Dashboard:** `index.html` (open in browser)
- **Model:** `model.pkl`
- **Documentation:** `INTEGRATION_ARCHITECTURE.md`

---

## 💡 Pro Tips

1. **Keep API running** in one terminal while using dashboard
2. **Use mock mode** to test without smartwatch
3. **Check browser console** (F12) for errors
4. **Monitor AI predictions** - they update in real-time
5. **Historical data** keeps last 1000 points

---

## 📱 Supported Smartwatches

**Tested & Working:**
- FB BGR001 ✅
- Other BLE health trackers with HR notifications (likely compatible)

**To use different device:**
1. Find device Bluetooth address
2. Find heart rate characteristic UUID
3. Update in `api_bridge.py`:
```python
DEVICE_ADDRESS = "YOUR:DEVICE:ADDRESS"
HEART_RATE_UUID = "YOUR_HEART_RATE_UUID"
```

---

## 🆘 Need Help?

1. Check `INTEGRATION_ARCHITECTURE.md` for detailed docs
2. Review browser console for JavaScript errors
3. Check terminal for Python errors
4. Verify all files are in same directory

---

**You're all set! Click "▶ Start Streaming" to begin monitoring your health.** 🎉

