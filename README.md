# TulsiRaksha AI

TulsiRaksha AI is a voice-first elder-care web application focused on safety, routine health tracking, and family communication. It combines an elder-friendly dashboard, multilingual interaction, risk signaling, and WhatsApp caregiver reporting.

## Overview

This repository includes:

- A Next.js App Router frontend for daily care workflows.
- Supabase authentication and cloud-sync support.
- A Twilio WhatsApp alert/report pipeline.
- Optional Python ML service for risk prediction inference.

## Core Features

- Voice assistant panel for elder-friendly interaction (Web Speech API).
- Multilingual UI dictionary support (English, Kannada, Hindi).
- Health vitals and trend cards (heart rate, steps, sleep, medicine adherence).
- Daily checklist and quick action utilities (including emergency flow).
- Authentication-enabled dashboard sync with offline fallback behavior.
- Caregiver reporting through WhatsApp via Twilio.
- Optional local ML inference hook for risk classification.

## Tech Stack

- Frontend: Next.js 16, React 19
- Styling: Tailwind CSS 4
- Auth and data: Supabase
- Messaging: Twilio WhatsApp API
- Optional ML service: Flask + scikit-learn

## Project Structure

```text
app/
	api/
		auth/
		fitbit/
		health-data/
		send-whatsapp-report/
	components/
	login/
	layout.js
	page.js
	i18n.js
lib/
	supabaseClient.js
	twilioWhatsApp.js
	whatsappReport.js
	getRiskFromML.js
public/
app.py
train_model.py
health_data.csv
model.pkl
```

## Prerequisites

- Node.js 18+
- npm 9+
- Optional (for ML service): Python 3.10+

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/SudeepSBingolli/TulsiRaksha-AI.git
cd TulsiRaksha-AI
```

2. Install frontend dependencies.

```bash
npm install
```

3. Create environment file.

```bash
cp .env.example .env.local
```

4. Start frontend development server.

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Configure these values in .env.local:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CAREGIVER_WHATSAPP_TO=whatsapp:+919999999999
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- npm run dev: Start development server
- npm run build: Create production build
- npm run start: Run production server
- npm run lint: Run ESLint checks

## WhatsApp Reporting Flow

- Route: POST /api/send-whatsapp-report
- Input: User status payload (name, heart rate, risk, checklist, location)
- Behavior:
	- Normalizes and formats a readable care summary.
	- Sends message to caregiver WhatsApp number via Twilio.
	- Returns send status JSON response.

## Optional ML Risk Service

The frontend can call a local Python endpoint for risk prediction through lib/getRiskFromML.js.

### Train model

```bash
python train_model.py
```

### Run inference API

```bash
python app.py
```

Service endpoint expected by frontend:

- POST http://127.0.0.1:5000/predict

Payload:

```json
{
	"heart_rate": 92,
	"steps": 4600,
	"sleep": 6.5,
	"medicine": 1
}
```

## API Endpoints in Repo

- POST /api/send-whatsapp-report: Active, Twilio integration
- GET /api/health-data: Placeholder
- GET /api/auth/magic-link: Placeholder
- GET /api/auth/webauthn/register-options: Placeholder
- GET /api/fitbit/sync: Placeholder

## Supabase Notes

- Auth is wired through client-side Supabase session handling.
- UI supports logged-in sync and offline demo behavior.
- If signup trigger/database settings are incomplete, login page surfaces guidance for quick fixes.

## Production Readiness Checklist

- Set strong Supabase Row Level Security policies.
- Validate Twilio credentials and caregiver destination numbers.
- Add server-side input validation and rate limiting for API routes.
- Replace placeholder API routes with real integrations.
- Add monitoring, error reporting, and audit logs for alerts.

## License

This project is licensed under the MIT License. See LICENSE for details.
