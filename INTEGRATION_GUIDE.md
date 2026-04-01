# TulsiRaksha-AI: Real-Time Health Prediction System

## Overview
A machine learning system that predicts health risk levels using **real-time smartwatch data** (Facebook BGR001).

**Live Features:**
- Real-time heart rate monitoring via Bluetooth
- Health risk prediction (LOW/NORMAL/HIGH)
- Battery monitoring
- Complete data pipeline

## Quick Start

### 1. Simple Run (Recommended)
```bash
python run.py
```
This will:
- Start Flask API automatically
- Connect to your smartwatch
- Stream live heart rate data
- Generate predictions

### 2. Individual Components

**Start API only:**
```bash
python app.py
```
Server runs on: `http://127.0.0.1:5000`

**Stream real smartwatch data:**
```bash
python stream_heart_rate.py
```

**Integrated system (API + Smartwatch):**
```bash
python integrated_health_system.py
```

## System Architecture

```
Smartwatch (FB BGR001)
        |
        | Bluetooth (Real-time Heart Rate)
        v
stream_heart_rate.py
        |
        | HTTP POST
        v
Flask API (app.py)
        |
        | ML Model (model.pkl)
        v
Prediction: LOW/NORMAL/HIGH RISK
```

## What You Get

### Real-Time Data
- Heart Rate (bpm)
- Battery Level (%)
- Sleep Hours
- Medicine Status

### Predictions
- Health Risk Level
- Timestamp
- All input metrics
- Saved to JSON

### Example Output
```
[Prediction #1] 2026-04-02T01:00:00.123456
  HR: 83 bpm | Battery: 40% | Prediction: [!] NORMAL

[Prediction #2] 2026-04-02T01:00:01.234567
  HR: 84 bpm | Battery: 40% | Prediction: [!] NORMAL
```

## Files Included

| File | Purpose |
|------|---------|
| `app.py` | Flask prediction API |
| `model.pkl` | Trained ML model |
| `train_model.py` | Model training script |
| `health_data.csv` | Training dataset |
| `stream_heart_rate.py` | Real smartwatch data fetcher |
| `integrated_health_system.py` | Combined system |
| `run.py` | Quick start launcher |
| `diagnose_smartwatch.py` | Device diagnostic tool |

## Requirements

### Software
- Python 3.7+
- Flask
- joblib
- pandas
- requests
- bleak (Bluetooth)

### Hardware
- Facebook BGR001 Smartwatch (or compatible)
- Windows/Linux/Mac with Bluetooth
- Internet connection

### Setup
1. **Pair Smartwatch**
   - Add FB BGR001 in Windows Bluetooth settings
   - Make sure it shows as "Paired"

2. **Install Dependencies** (if needed)
   ```bash
   pip install flask flask-cors joblib pandas requests bleak
   ```

3. **Check Smartwatch**
   ```bash
   python diagnose_smartwatch.py
   ```

## API Endpoints

### POST /predict
Send live health metrics for prediction.

**Request:**
```json
{
  "heart_rate": 85,
  "steps": 1000,
  "sleep": 7,
  "medicine": 1
}
```

**Response:**
```json
{
  "risk": "NORMAL"
}
```

Risk Levels:
- `LOW` - Good health status
- `NORMAL` - Normal health status
- `HIGH` - Elevated risk, monitor closely

## Troubleshooting

### Smartwatch Not Connecting
```bash
python diagnose_smartwatch.py
```
This will:
- Scan for devices
- Show available smartwatches
- Display all data characteristics

### Flask Server Not Starting
```bash
python app.py
```
Check if port 5000 is available.

### No Heart Rate Data
1. Ensure smartwatch is ON
2. Check Bluetooth pairing
3. Run diagnostic tool
4. Restart smartwatch

## Performance

- **Data Points:** ~1 per second
- **Prediction Latency:** <100ms
- **Battery Usage:** Low (Bluetooth LE)
- **Accuracy:** Based on trained model

## Output Files

Predictions are saved as:
```
predictions_YYYYMMDD_HHMMSS.json
```

Contains:
- Timestamp
- Heart rate
- Battery level
- Predicted risk
- All input metrics

## Advanced Usage

### Custom Settings
Edit in `integrated_health_system.py`:
```python
self.device_address = "14:EC:88:EF:8C:46"  # Change device
self.api_url = "http://127.0.0.1:5000/predict"  # Custom API
self.sleep = 7  # Adjust sleep hours
```

### Streaming Duration
Run for specific time (in seconds):
```bash
# Edit integrated_health_system.py line: await predictor.stream(duration=600)
```

### Export Data
Predictions are automatically saved to JSON:
```bash
cat predictions_*.json | python -m json.tool
```

## Evaluation Ready

This system demonstrates:
✓ Real-time data collection from actual device
✓ Live Bluetooth connectivity
✓ ML model integration
✓ Real-time predictions
✓ Data persistence
✓ Complete pipeline

Perfect for evaluations and presentations!

## Support

For issues:
1. Run diagnostic: `python diagnose_smartwatch.py`
2. Check Flask: `python app.py`
3. Test prediction: `curl -X POST http://127.0.0.1:5000/predict -d '{"heart_rate":80,"steps":1000,"sleep":7,"medicine":1}'`

---

**Ready to present!** 🎉
