# 🌿 TulsiRaksha AI

> **A voice-first AI companion for elder care** — combining real-time health monitoring, multilingual voice guidance, family communication, and intelligent risk prediction in a single easy-to-use web application.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-auth%20%26%20data-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Goals](#-goals)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Python ML Service](#-python-ml-service)
- [Smartwatch Integration](#-smartwatch-integration)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Production Checklist](#-production-checklist)
- [License](#-license)

---

## 🎯 Goals

TulsiRaksha AI is built to address the unique challenges faced by elderly individuals living alone or with limited physical assistance. Our goals are:

1. **Safety first** — Detect health risks early and alert caregivers instantly through WhatsApp.
2. **Accessibility** — Provide a large-text, voice-guided interface designed for elders with limited tech experience.
3. **Multilingual inclusion** — Support English, Kannada, and Hindi so elders feel at home in their native language.
4. **Family connection** — Keep family caregivers informed with automated daily health summaries.
5. **Intelligent monitoring** — Use a trained ML model to classify risk levels (LOW / NORMAL / HIGH) from wearable health data.
6. **Privacy and consent** — All voice personalization and biometric features require explicit user consent.

---

## ✨ Features

### Elder-Facing Dashboard
- Personalized greeting card with time-of-day awareness
- Daily checklist for medicine, meals, and activities
- Upcoming reminders panel (medicines, doctor calls, walks)
- Quick action buttons including an **SOS emergency alert**
- Activity chart showing daily health trends

### Voice Assistant
- 🎙️ **Web Speech API** browser fallback for offline voice
- 🔊 **ElevenLabs TTS** for high-quality, warm voice responses
- Consent-based **voice personalization** — users choose their preferred voice
- Real-time health-aware messages (greets with vitals, alerts on high risk)
- Play / pause / volume controls and replay functionality

### Health Monitoring
- Live vitals cards: heart rate, steps, sleep, medicine adherence
- Real-time risk prediction from a scikit-learn ML model
- **Emotion detection panel** (camera-based, face-api.js)
- Bluetooth LE smartwatch integration (FB BGR001 and compatible devices)

### Authentication
- Email and phone signup with OTP verification (Twilio SMS + nodemailer)
- Password login with bcrypt hashing
- Fingerprint / biometric login via **WebAuthn**
- Login audit log stored in Supabase
- Row Level Security (RLS) enforced on all user data

### Family & Caregiver Tools
- **WhatsApp reporting** via Twilio — sends formatted health summaries to caregivers
- Family sync page for shared health visibility
- Profile settings page for elders and family members

### Multilingual Support
- Full UI dictionary for **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिन्दी)**
- Language switcher accessible from the navigation bar

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4 |
| Auth & database | Supabase (PostgreSQL + Auth) |
| Voice TTS | ElevenLabs API, Web Speech API (fallback) |
| Messaging | Twilio WhatsApp API, Twilio SMS |
| Email | Nodemailer (Gmail or SMTP) |
| Biometric auth | WebAuthn (browser-native) |
| Emotion / face detection | face-api.js |
| ML inference service | Python · Flask · scikit-learn · joblib |
| Smartwatch BLE | Python · Bleak (Bluetooth LE) |
| Password hashing | bcrypt |

---

## 📂 Project Structure

```text
TulsiRaksha-AI/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   ├── (protected)/              # Protected layout group
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Auth endpoints (OTP, login, logout, WebAuthn)
│   │   ├── fitbit/               # Fitbit sync placeholder
│   │   ├── health-data/          # Health data placeholder
│   │   ├── send-whatsapp-report/ # Twilio WhatsApp report
│   │   ├── speak/                # ElevenLabs TTS endpoint
│   │   └── voice/                # Voice preference endpoints
│   ├── assistant/                # Voice assistant page
│   ├── components/               # Shared React components
│   │   ├── Dashboard.jsx
│   │   ├── HealthMetrics.jsx
│   │   ├── VoiceAssistant.jsx
│   │   ├── VoicePersonalizationPanel.jsx
│   │   ├── EmotionDetectionPanel.jsx
│   │   ├── EmotionVoiceCompanion.jsx
│   │   ├── Checklist.jsx
│   │   ├── QuickActions.jsx
│   │   ├── ActivityChart.jsx
│   │   ├── GreetingCard.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── LandingView.jsx
│   ├── family/                   # Family sync page
│   ├── health/                   # Health details page
│   ├── login/                    # Login page
│   ├── profile/                  # Profile settings page
│   ├── reminders/                # Reminders page
│   ├── i18n.js                   # Multilingual dictionary (EN / KN / HI)
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home / landing page
├── hooks/
│   └── useLogout.js              # Logout hook
├── lib/
│   ├── supabaseClient.js         # Supabase browser client
│   ├── twilioWhatsApp.js         # Twilio WhatsApp helper
│   ├── whatsappReport.js         # Report formatter
│   ├── getRiskFromML.js          # Calls Python ML service
│   ├── voiceHealthIntegration.js # Health-aware TTS messages
│   ├── personalizedVoice.js      # Voice preference logic
│   ├── encryption.js             # Encryption utilities
│   └── webauthn-config.js        # WebAuthn configuration
├── supabase/
│   ├── auth_schema.sql           # Auth tables migration
│   ├── profiles_rls.sql          # Row Level Security policies
│   └── voice_personalization.sql # Voice preferences table
├── public/                       # Static assets
├── app.py                        # Flask ML inference API
├── train_model.py                # Train the scikit-learn model
├── unified_api.py                # Unified Flask API (smartwatch + ML)
├── api_bridge.py                 # BLE smartwatch data bridge
├── launch_stack.py               # One-command stack launcher
├── smartwatch_simulator.py       # Simulated smartwatch data
├── health_data.csv               # Training dataset
├── model.pkl                     # Pre-trained ML model
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
└── .env.local.template           # Environment variable template
```

---

## 📋 Prerequisites

### Frontend (required)
| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18.x or higher |
| npm | 9.x or higher |

### Python ML & Smartwatch Service (optional)
| Requirement | Minimum Version |
|-------------|----------------|
| Python | 3.10 or higher |
| pip | 22.x or higher |
| Bluetooth LE adapter | Required only for real smartwatch data |

### External Services (required for full functionality)
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Supabase](https://supabase.com/) | Auth, database, real-time | ✅ Yes |
| [Twilio](https://www.twilio.com/) | WhatsApp reports, SMS OTP | Trial credits |
| [ElevenLabs](https://elevenlabs.io/) | High-quality TTS voice | ✅ 10k chars/month |
| Gmail / SMTP | Email OTP verification | ✅ Yes |

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/SudeepSBingolli/TulsiRaksha-AI.git
cd TulsiRaksha-AI
```

### 2. Install frontend (Node.js) dependencies

```bash
npm install
```

This installs all packages listed in `package.json`, including:
- `next`, `react`, `react-dom`
- `@supabase/supabase-js`
- `twilio`, `nodemailer`
- `bcrypt`
- `face-api.js`
- Tailwind CSS and ESLint dev tools

### 3. Configure environment variables

```bash
cp .env.local.template .env.local
```

Open `.env.local` and fill in your credentials. See the [Environment Variables](#-environment-variables) section for a full reference.

### 4. Set up Supabase database

In your Supabase project's **SQL Editor**, run the migration files in this order:

```sql
-- 1. Authentication tables (user profiles, OTP codes, login logs)
-- Run: supabase/auth_schema.sql

-- 2. Row Level Security policies
-- Run: supabase/profiles_rls.sql

-- 3. Voice personalization preferences table
-- Run: supabase/voice_personalization.sql
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. (Optional) Install Python dependencies for the ML service

```bash
pip install -r requirements.txt
```

This installs:
- `flask`, `flask-cors` — API server
- `scikit-learn`, `pandas`, `joblib` — ML model
- `bleak` — Bluetooth LE for smartwatch
- `requests`, `gunicorn` — HTTP utilities and production server

### 7. (Optional) Train and start the ML service

```bash
# Train the risk prediction model (generates model.pkl)
python train_model.py

# Start the inference API on http://127.0.0.1:5000
python app.py
```

---

## 🔐 Environment Variables

Create `.env.local` from the template and populate the following keys:

```bash
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ── Twilio WhatsApp & SMS ──────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CAREGIVER_WHATSAPP_TO=whatsapp:+919999999999
TWILIO_PHONE_FROM=+1234567890        # For SMS OTP

# ── ElevenLabs TTS ────────────────────────────────────────
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_ELEVENLABS_ENABLED=true
NEXT_PUBLIC_DEFAULT_VOICE_ID=EXAVITQu4vLvkujnVJL5
NEXT_PUBLIC_VOICE_PERSONALIZATION_ENABLED=true
MAX_TTS_DURATION=60                  # Max audio seconds (cost control)
NEXT_PUBLIC_CACHE_AUDIO=true
NEXT_PUBLIC_VOICE_HEALTH_ALERTS=true
MIN_VOICE_ALERT_INTERVAL=10          # Minutes between auto-alerts
VOICE_ALERT_RISK_LEVELS=HIGH,CRITICAL

# ── Email (for OTP verification) ──────────────────────────
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# ── Optional ──────────────────────────────────────────────
JWT_SECRET=your-jwt-secret           # Optional auth token signing
```

> **Tip:** Use a [Gmail App Password](https://support.google.com/accounts/answer/185833) for `EMAIL_PASSWORD`, not your regular Gmail password.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production server (requires `npm run build` first) |
| `npm run lint` | Run ESLint code quality checks |
| `npm run stack` | Launch frontend + Flask ML API + BLE bridge in one command |

---

## 🤖 Python ML Service

The ML service provides real-time health risk prediction (LOW / NORMAL / HIGH) from four inputs: heart rate, steps, sleep hours, and medicine adherence.

### Train the model

```bash
python train_model.py
```

Reads `health_data.csv`, trains a scikit-learn classifier, and saves `model.pkl`.

### Start the inference API

```bash
python app.py
```

The server starts at `http://127.0.0.1:5000`.

### Predict endpoint

**POST** `http://127.0.0.1:5000/predict`

```json
{
  "heart_rate": 92,
  "steps": 4600,
  "sleep": 6.5,
  "medicine": 1
}
```

**Response:**

```json
{
  "risk": "HIGH",
  "confidence": 0.87
}
```

The Next.js frontend calls this service via `lib/getRiskFromML.js` and displays the risk level in the health dashboard.

---

## ⌚ Smartwatch Integration

TulsiRaksha AI can ingest live Bluetooth LE data from smartwatches (tested with FB BGR001).

### Start the full real-time stack

```bash
npm run stack
# equivalent to: python launch_stack.py
```

This starts the Next.js dev server, the Flask ML API, and the BLE data bridge simultaneously.

### Target a specific device by Bluetooth address

```bash
python launch_stack.py --device 14:EC:88:EF:8C:46
```

### Run the unified API server (smartwatch + ML) standalone

```bash
python unified_api.py
```

Available endpoints at `http://127.0.0.1:5000`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live-health` | GET | Latest smartwatch readings |
| `/api/predict-live` | GET | Risk prediction from live data |
| `/api/health-history` | GET | Historical readings (query: `?limit=50`) |
| `/api/predictions-history` | GET | Historical predictions |
| `/api/stats` | GET | Aggregated health statistics |
| `/api/dashboard` | GET | Complete dashboard payload |
| `/api/predict` | POST | Predict from custom input |
| `/api/batch-predict` | POST | Batch predictions |
| `/api/bridge/status` | GET | BLE bridge status |
| `/api/bridge/start` | POST | Start the BLE bridge |
| `/api/bridge/stop` | POST | Stop the BLE bridge |

### Test without a physical device

```bash
# Simulates smartwatch data for development
python smartwatch_simulator.py
```

---

## 🔌 API Reference (Next.js Routes)

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/api/speak` | POST | ✅ Active | Convert text to speech via ElevenLabs |
| `/api/send-whatsapp-report` | POST | ✅ Active | Send health summary to caregiver via Twilio WhatsApp |
| `/api/auth/send-email-verification` | POST | ✅ Active | Send 6-digit email OTP |
| `/api/auth/verify-email-code` | POST | ✅ Active | Verify email OTP |
| `/api/auth/send-phone-verification` | POST | ✅ Active | Send SMS OTP via Twilio |
| `/api/auth/verify-phone-code` | POST | ✅ Active | Verify phone OTP |
| `/api/auth/create-user-profile` | POST | ✅ Active | Create user account (bcrypt password) |
| `/api/auth/login-with-password` | POST | ✅ Active | Password-based login |
| `/api/auth/login-with-fingerprint` | POST | ✅ Active | WebAuthn fingerprint login |
| `/api/auth/logout` | POST | ✅ Active | Clear session |
| `/api/health-data` | GET | 🔧 Placeholder | Fetch health data |
| `/api/fitbit/sync` | GET | 🔧 Placeholder | Fitbit sync |

---

## ☁️ Deployment

### Vercel (recommended for frontend)

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy from the project root:

   ```bash
   vercel
   ```

3. Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

4. See `VERCEL_DEPLOYMENT.md` for the complete cloud + smartwatch data pipeline setup.

### Production Python service (Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 unified_api:app
```

---

## ✅ Production Checklist

- [ ] Set strong **Supabase Row Level Security** policies on all tables
- [ ] Validate Twilio credentials and caregiver destination numbers
- [ ] Add server-side **input validation and rate limiting** on API routes
- [ ] Replace placeholder API routes (`/api/health-data`, `/api/fitbit/sync`) with real integrations
- [ ] Add monitoring, error reporting, and audit logs for alerts
- [ ] Rotate the `ELEVENLABS_API_KEY` and never expose it to the browser
- [ ] Use a **Gmail App Password** (not your main password) for email OTP
- [ ] Enable HTTPS — required by Web Audio API and WebAuthn
- [ ] Review and enforce consent policies for voice personalization

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
