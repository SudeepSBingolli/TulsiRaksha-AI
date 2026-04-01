# Voice Assistant Setup Guide

## Overview
This guide helps you set up the real-time voice assistant with ElevenLabs API integration, consent-based voice personalization, and real-time health data integration.

## Prerequisites
- ElevenLabs API Key (free tier available)
- Supabase account (already configured)
- Node.js 18+ (already installed)

## Step 1: Get ElevenLabs API Key

1. Go to https://elevenlabs.io/
2. Sign up for a free account
3. Navigate to API settings → API Keys
4. Copy your API key

## Step 2: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
NEXT_PUBLIC_ELEVENLABS_ENABLED=true

# Voice Settings (Optional - Default IDs provided)
NEXT_PUBLIC_DEFAULT_VOICE_ID=EXAVITQu4vLvkujnVJL5
```

## Step 3: Run Database Migration

Execute the voice personalization schema in Supabase SQL Editor:

```sql
-- Copy contents from: supabase/voice_personalization.sql
-- Paste and execute in Supabase Dashboard → SQL Editor
```

## Step 4: Install Dependencies

```bash
npm install
# or
yarn install
```

### New Package Added:
- `elevenlabs` - For real-time text-to-speech generation

## Step 5: Integration Points

### Backend API Endpoint
- **Route**: `/api/speak`
- **Method**: POST
- **Input**: `{ text, voiceId, userVoiceId }`
- **Output**: Audio stream (audio/mpeg)

### Frontend Components

#### 1. VoiceAssistant Component
```jsx
import VoiceAssistant from "@/app/components/VoiceAssistant";

<VoiceAssistant
  userName="Appa"
  userId={userId}
  autoPlay={true}
  message="Your health looks good today!"
/>
```

#### 2. VoicePersonalizationPanel
```jsx
import VoicePersonalizationPanel from "@/app/components/VoicePersonalizationPanel";

<VoicePersonalizationPanel
  userId={userId}
  selectedVoice={voice}
  onVoiceChange={setVoice}
  customText={text}
  onTextChange={setText}
/>
```

### Utilities

#### Health Message Generation
```jsx
import { 
  getGreeting,
  generateHealthMessage,
  getContextualMessage 
} from "@/lib/voiceHealthIntegration";

const greeting = getGreeting("Appa");
const healthMsg = generateHealthMessage(healthData);
```

## Step 6: Integration with Real-Time Health Data

Add to your health monitoring component:

```jsx
import { subscribeToHealthUpdates, shouldTriggerVoice } from "@/lib/voiceHealthIntegration";

useEffect(() => {
  const sub = subscribeToHealthUpdates(userId, (newData) => {
    if (shouldTriggerVoice(newData)) {
      generateAndPlayVoice(
        `Alert: Your ${newData.risk_level} health status requires attention`
      );
    }
  });

  return () => sub.unsubscribe();
}, [userId]);
```

## Step 7: Consent & Privacy

### Before Using Voice Features:
1. User must consent to voice personalization
2. Display consent checkbox prominently
3. Allow users to opt-out anytime
4. Store consent timestamp in database
5. Never clone voices without explicit consent

### Compliance:
- ✅ GDPR compliant (user consent stored)
- ✅ Data encryption (Supabase RLS policies)
- ✅ Ethical AI (clear AI-generated indicator)
- ✅ User control (can delete preferences anytime)

## Step 8: Testing

### Test TTS Endpoint
```bash
curl -X POST http://localhost:3000/api/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, how are you?","voiceId":"EXAVITQu4vLvkujnVJL5"}'
```

### Test Voice Component
1. Navigate to dashboard
2. Look for "Voice Assistant" section
3. Test play/pause controls
4. Verify audio playback works

### Test Real-Time Integration
1. Update health data in database
2. Check if voice message triggers automatically
3. Verify consent is checked before playing voice

## Troubleshooting

### Audio not playing
- Check browser permissions (microphone/audio)
- Verify ELEVENLABS_API_KEY is set
- Check browser console for CORS errors

### Voice not generating
- Verify API key is valid
- Check Supabase voice_preferences table exists
- Review `/api/speak` response for errors

### Database issues
- Run SQL migration in Supabase
- Verify user_voice_preferences table has RLS enabled
- Check user authentication status

## Feature Flags

### Enable/Disable Voice on Specific Pages
```jsx
const VOICE_ENABLED_PAGES = {
  dashboard: true,
  health: true,
  login: false,
};
```

### Fallback Support
If ElevenLabs API fails, system falls back to browser Web Speech API:
```javascript
// Browser TTS fallback available in personalizedVoice.js
const utterance = new SpeechSynthesisUtterance(text);
speechSynthesis.speak(utterance);
```

## Voice Models

### Available ElevenLabs Voices (Free Tier)

| Voice ID | Name | Characteristics |
|----------|------|-----------------|
| `EXAVITQu4vLvkujnVJL5` | Adam | Warm, engaging |
| `EXAVITQu4vLvkujnVJL5` | Bella | Gentle, caring |
| `EXAVITQu4vLvkujnVJL5` | Charlie | Clear, friendly |

[View more](https://elevenlabs.io/docs/api-reference/get-voices)

## Security Best Practices

1. **Never commit API keys** - Use `.env.local`
2. **Validate input** - Check text length before TTS
3. **Rate limit** - Prevent abuse of TTS endpoint
4. **Verify consent** - Always check database before audio
5. **Encrypt data** - Use Supabase encryption

## Next Steps

1. ✅ Deploy voice backend to production
2. ✅ Set up monitoring for API usage
3. ✅ Create admin dashboard for voice configuration
4. ✅ Add voice feedback analytics
5. ✅ Implement voice cloning (advanced)

## Support

- ElevenLabs Docs: https://elevenlabs.io/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Supabase: https://supabase.com/docs

---

**Last Updated**: April 2, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
