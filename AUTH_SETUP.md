# TulsiRaksha Authentication System Setup Guide

This document outlines the new comprehensive authentication system for TulsiRaksha with email/phone signup, verification, and multi-factor authentication support.

## Overview

The new authentication system supports:
- ✉️ **Email-based signup** with email verification
- 📱 **Phone-based signup** with OTP verification
- 🔐 **Password-based login** (email or phone)
- 👆 **Fingerprint/Biometric authentication** (WebAuthn)
- 🚪 **Secure logout** with session management

## Architecture

### Database Schema

Three main tables are created:

1. **user_profiles** - Stores user account information
   - `id` (UUID, Primary Key)
   - `email` (VARCHAR, Unique)
   - `phone` (VARCHAR, Unique)
   - `password_hash` (VARCHAR)
   - `fingerprint_enabled` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **verification_codes** - Temporary verification codes for email/phone
   - `id` (UUID, Primary Key)
   - `email` or `phone` (VARCHAR)
   - `code` (VARCHAR - 6 digit OTP)
   - `type` ('email' or 'phone')
   - `verified` (BOOLEAN)
   - `expires_at` (TIMESTAMP - 10 minutes)

3. **user_login_logs** - Audit trail of login attempts
   - `id` (UUID, Primary Key)
   - `user_id` (Foreign Key to user_profiles)
   - `login_method` ('password' or 'fingerprint')
   - `login_time` (TIMESTAMP)
   - `ip_address`, `user_agent` (Optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `bcrypt` - Password hashing
- `twilio` - SMS/OTP delivery
- `nodemailer` - Email verification
- `@supabase/supabase-js` - Database

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_FROM=+1234567890  # Your Twilio phone number

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
EMAIL_SERVICE=gmail  # or another service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 3. Setup Supabase Database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase/auth_schema.sql`:

```sql
-- Run the entire auth_schema.sql file
```

This creates:
- `user_profiles` table
- `verification_codes` table
- `user_login_logs` table
- Necessary indexes
- Row Level Security (RLS) policies

### 4. Configure Twilio

1. Get a Twilio account at https://www.twilio.com
2. Get a phone number that supports SMS
3. Add credentials to `.env.local`
4. Test by sending an SMS

### 5. Configure Email Service

For Gmail:
1. Enable "Less secure app access" or use an App Password
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASSWORD`

For other services (SendGrid, Mailgun, etc.):
- Update `EMAIL_SERVICE` in `.env.local`
- Configure nodemailer transport accordingly

## User Flows

### Signup Flow

#### Option 1: Email Signup
1. User visits `/signup`
2. Chooses "Sign up with Email"
3. Enters email address
4. Verification email sent with 6-digit code
5. User enters code on `/auth/verify-email`
6. After verification, redirected to `/auth/setup-credentials`
7. User sets password and optionally registers fingerprint
8. Account created in database

#### Option 2: Phone Signup
1. User visits `/signup`
2. Chooses "Sign up with Phone"
3. Enters phone number with country code
4. OTP sent via SMS (Twilio)
5. User enters OTP on `/auth/verify-phone`
6. After verification, redirected to `/auth/setup-credentials`
7. User sets password and optionally registers fingerprint
8. Account created in database

### Login Flow

#### Password Login
1. User visits `/login`
2. Chooses email or phone tab
3. Enters identifier and password
4. API validates credentials via bcrypt
5. Login log recorded
6. User redirected to dashboard

#### Fingerprint Login
1. User visits `/login`
2. Checks "Use Fingerprint to Login"
3. Browser prompts for biometric authentication
4. WebAuthn assertion sent to server
5. Server validates assertion
6. Login log recorded
7. User redirected to dashboard

### Logout Flow
1. User clicks logout in navbar profile menu
2. API clears session
3. Client-side localStorage cleared
4. User redirected to login page

## API Routes

### Authentication Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/send-email-verification` | POST | Send verification email |
| `/api/auth/verify-email-code` | POST | Verify email code |
| `/api/auth/send-phone-verification` | POST | Send OTP via SMS |
| `/api/auth/verify-phone-code` | POST | Verify phone OTP |
| `/api/auth/create-user-profile` | POST | Create user account |
| `/api/auth/login-with-password` | POST | Password-based login |
| `/api/auth/login-with-fingerprint` | POST | Fingerprint-based login |
| `/api/auth/logout` | POST | Logout user |

## Frontend Routes

| Route | Purpose |
|-------|---------|
| `/signup` | Signup method selection |
| `/auth/verify-email` | Email verification page |
| `/auth/verify-phone` | Phone verification page |
| `/auth/setup-credentials` | Password & fingerprint setup |
| `/login` | Login page |
| `/` | Home/Dashboard (protected) |

## Security Features

1. **Password Hashing**: Using bcrypt with salt rounds (10)
2. **OTP Expiration**: Codes expire after 10 minutes
3. **Rate Limiting**: Implement rate limiting on verification endpoints (recommended)
4. **Secure Storage**: Passwords never stored in plain text
5. **Session Management**: User ID stored in localStorage
6. **RLS Policies**: Supabase Row Level Security enabled
7. **WebAuthn**: Hardware-backed fingerprint authentication

## Key Components

### authentication pages
- `app/signup/page.js` - Signup method selection
- `app/auth/verify-email/page.jsx` - Email verification
- `app/auth/verify-phone/page.jsx` - Phone verification
- `app/auth/setup-credentials/page.jsx` - Password & fingerprint setup
- `app/login/page.js` - Login page

### Hooks
- `hooks/useLogout.js` - Logout functionality

### API Routes
- `app/api/auth/*` - All authentication endpoints

## Testing

### Test Email Signup
```bash
1. Navigate to http://localhost:3000/signup
2. Click "Sign up with Email"
3. Enter a test email
4. Check email for verification code
5. Enter code and verify
6. Set password and fingerprint
7. Login with new account
```

### Test Phone Signup
```bash
1. Navigate to http://localhost:3000/signup
2. Click "Sign up with Phone"
3. Enter phone with country code (e.g., +919876543210)
4. Check phone for OTP
5. Enter OTP and verify
6. Set password and fingerprint
7. Login with phone
```

## Troubleshooting

### Email not sent
- Check `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` in .env.local
- For Gmail, ensure App Password is used, not regular password
- Check email service logs

### SMS/OTP not sent
- Verify Twilio credentials in .env.local
- Ensure Twilio account has sufficient balance
- Check phone number format (must include country code)

### Database errors
- Ensure all tables are created using auth_schema.sql
- Check Supabase URL and API keys
- Verify RLS policies are enabled

### WebAuthn not working
- Ensure browser supports WebAuthn (Chrome, Firefox, Safari 13+)
- Must be on HTTPS (or localhost)
- Device must have biometric sensor or security key

## Next Steps

1. **Rate Limiting**: Add rate limiting to prevent brute force attacks
2. **Two-Factor Authentication**: Add TOTP setup
3. **Session Tokens**: Implement JWT tokens for better session management
4. **Email Templates**: Create custom HTML email templates
5. **Analytics**: Track signup/login metrics
6. **Password Recovery**: Add forgot password functionality
7. **Social Login**: Add OAuth integrations (Google, GitHub, etc.)

## Support

For issues or questions:
1. Check Environment variables
2. Review API response errors
3. Check browser console for client-side errors
4. Review server logs for API errors
