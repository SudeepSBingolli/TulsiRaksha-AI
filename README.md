# TulsiRaksha-AI

TulsiRaksha AI is an AI-driven predictive elder care platform that combines real-time monitoring, intelligent risk analysis, and automated alerts to prevent health emergencies and enhance independent living.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SudeepSBingolli/TulsiRaksha-AI.git
cd TulsiRaksha-AI/tulsiraksha-ai
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production bundle
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

- `app/` - Next.js app directory with page components
- `public/` - Static assets
- `package.json` - Project dependencies and scripts

## WhatsApp Tracking and Alerts

This project includes a WhatsApp reporting flow for elder-care status updates.

### API Route

- Endpoint: `POST /api/send-whatsapp-report`
- File: `app/api/send-whatsapp-report/route.js`
- Behavior:
	- Collects user name, heart rate, risk level, checklist summary, and live location
	- Formats a readable WhatsApp message
	- Sends to caregiver via Twilio WhatsApp API

### Environment Variables

Create `.env.local` using values from `.env.example`:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CAREGIVER_WHATSAPP_TO=whatsapp:+919999999999
```

### Frontend Trigger

- Button: `Send Update to Family` in `app/components/HealthMetrics.jsx`
- On click: Calls `/api/send-whatsapp-report`
- Auto-trigger: When risk becomes `HIGH`, a WhatsApp alert is automatically sent once for that high-risk window

### Supabase Tables (for demo)

Create these tables in Supabase SQL editor:

```sql
create table if not exists public.health_data (
	id bigint generated always as identity primary key,
	user_id uuid,
	heart_rate int not null,
	risk text not null,
	source text,
	created_at timestamptz default now()
);

create table if not exists public.checklist_items (
	id bigint generated always as identity primary key,
	user_id uuid not null,
	item_key text not null,
	checked boolean default false,
	updated_at timestamptz default now(),
	unique (user_id, item_key)
);
```

If table access fails, the app automatically falls back to offline mode using local state.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
