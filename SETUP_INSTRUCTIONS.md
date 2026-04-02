# Setup Instructions

This guide helps you run TulsiRaksha AI locally for web demo, optional ML service, and Android packaging.

## 1. Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+ (optional, for ML service)
- Java 21 and Android Studio (for Android packaging)

## 2. Clone and Install

```bash
git clone https://github.com/SudeepSBingolli/TulsiRaksha-AI.git
cd TulsiRaksha-AI
npm install
```

## 3. Configure Environment

Windows:

```bash
copy .env.local.template .env.local
```

Linux/macOS:

```bash
cp .env.local.template .env.local
```

Edit .env.local and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
CAREGIVER_WHATSAPP_TO=
```

## 4. Run the Web Application

```bash
npm run dev
```

Open http://localhost:3000

## 5. Production Build Check

```bash
npm run build
npm run start
```

## 6. Optional Python ML API

Install dependencies:

```bash
pip install -r requirements.txt
```

Train model:

```bash
python train_model.py
```

Run API:

```bash
python app.py
```

Expected local endpoint:

- POST http://127.0.0.1:5000/predict

## 7. Run Integrated Local Stack

```bash
npm run stack
```

Optional smartwatch target:

```bash
python launch_stack.py --device 14:EC:88:EF:8C:46
```

## 8. Android Sync and Build (Capacitor)

```bash
npm run cap:sync
```

For local Android debug build:

```bash
cd android
gradlew.bat assembleDebug
```

## 9. Appflow Packaging Notes

- Keep appflow.config.json updated with the correct appId
- Root gradlew script is required for Appflow CI
- Capacitor generated Gradle files are committed for stable cloud builds

## 10. Troubleshooting

- If Next.js build fails, run npm install then npm run build again
- If Capacitor files are missing, run npm run cap:sync locally and commit android changes
- If Appflow fails on appId, verify appflow.config.json apps entry matches your Appflow project id

