# TulsiRaksha-AI: Vercel Deployment Guide

## Quick Overview

Deploy your health prediction system on Vercel and send real smartwatch data to it!

**Architecture:**
```
Local Smartwatch (FB BGR001)
        ↓ (Bluetooth)
Local Python Script (send_to_vercel.py)
        ↓ (HTTP POST)
Vercel Cloud API (vercel_api.py)
        ↓
Predictions Stored in Cloud
```

## Deployment Steps

### Step 1: Prepare Files for Deployment

Ensure these files exist:
- `vercel_api.py` - API (Vercel runs this)
- `model.pkl` - Your trained model
- `requirements.txt` - Dependencies
- `vercel.json` - Vercel config

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

Or download from: https://vercel.com/download

### Step 3: Login to Vercel

```bash
vercel login
```
Creates account if needed.

### Step 4: Deploy

```bash
cd "C:\Users\SUDEE\Desktop\TulsiRashka AI\TulsiRaksha-AI"
vercel
```

Follow prompts:
- Project name: `tulsiraksha-ai`
- Framework: `Flask`

**You'll get URL like:**
```
https://tulsiraksha-ai.vercel.app
```

### Step 5: Send Smartwatch Data

**Edit `send_to_vercel.py`:**

Change:
```python
API_ENDPOINT = "http://127.0.0.1:5000"
```

To your Vercel URL:
```python
API_ENDPOINT = "https://tulsiraksha-ai.vercel.app"
```

### Step 6: Run Data Sender

```bash
python send_to_vercel.py
```

This sends your smartwatch data to Vercel!

## Usage

### From Local (Testing)

**Terminal 1:**
```bash
python vercel_api.py
```

**Terminal 2:**
```bash
python send_to_vercel.py
```

### From Cloud (Production)

1. Deploy to Vercel (steps above)
2. Run `send_to_vercel.py` locally (it sends to cloud)
3. View results online

## API Endpoints

### Predict
```bash
curl -X POST https://YOUR_URL/predict \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 85,
    "steps": 1000,
    "sleep": 7,
    "medicine": 1
  }'
```

Response:
```json
{
  "risk": "NORMAL",
  "heart_rate": 85,
  "timestamp": "2026-04-02T01:15:00.123456"
}
```

### Get All Data
```bash
curl https://YOUR_URL/data
```

### Get Statistics
```bash
curl https://YOUR_URL/stats
```

### Batch Predict
```bash
curl -X POST https://YOUR_URL/batch \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"heart_rate": 80, "steps": 1000, "sleep": 7, "medicine": 1},
      {"heart_rate": 85, "steps": 1200, "sleep": 7, "medicine": 1}
    ]
  }'
```

## File Structure

```
TulsiRaksha-AI/
├── vercel_api.py          # Main API (deployed)
├── app.py                 # Local Flask app
├── send_to_vercel.py      # Smartwatch data sender
├── stream_heart_rate.py   # Local streaming
├── model.pkl              # ML model
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel config
└── health_data.csv       # Training data
```

## For Your Evaluation

Show:
1. **Local setup works**
   ```bash
   python app.py
   # Terminal 2:
   python stream_heart_rate.py
   ```

2. **Vercel deployment works**
   ```bash
   python send_to_vercel.py
   ```

3. **View cloud data**
   ```bash
   curl https://YOUR_URL/stats
   ```

## Troubleshooting

### API not responding
- Check if Vercel deployment succeeded: `vercel ls`
- Check logs: `vercel logs`
- Test locally first: `python vercel_api.py`

### Data not arriving
- Check smartwatch is ON
- Check API endpoint in `send_to_vercel.py`
- Watch terminal output for errors

### Model not loading
- Ensure `model.pkl` is in deployment
- Check file size: `ls -lh model.pkl`

## Advanced: Custom Vercel Settings

### Build Output Directory
Edit `vercel.json`:
```json
{
  "outputDirectory": "."
}
```

### Environment Variables
```bash
vercel env add FLASK_ENV production
```

### Custom Domain
```bash
vercel domains add yourdomain.com
```

## Summary

**Local Testing:**
```bash
# Terminal 1
python vercel_api.py

# Terminal 2
python send_to_vercel.py
```

**Production (Vercel):**
```bash
vercel
# Deploy done!

# Edit send_to_vercel.py with your URL
python send_to_vercel.py
```

**Verify:**
```bash
curl https://YOUR_URL/stats
```

## Next Steps

1. Create account at https://vercel.com
2. Install Vercel CLI: `npm install -g vercel`
3. Deploy: `vercel`
4. Update API endpoint in `send_to_vercel.py`
5. Run data sender
6. Share cloud URL with evaluators

---

**Questions?** Check Vercel docs: https://vercel.com/docs
