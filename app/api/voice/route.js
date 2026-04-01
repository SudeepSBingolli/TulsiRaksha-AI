export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  return Response.json(
    {
      configured: Boolean(apiKey && voiceId),
    },
    { status: 200 }
  );
}

export async function POST(request) {
  try {
    const { text, voiceProfile = "family_warm" } = await request.json();

    if (!text || !String(text).trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const configuredVoiceId = process.env.ELEVENLABS_VOICE_ID;

    // Optional demo mapping for multiple family voice choices.
    const demoVoiceMap = {
      family_warm: configuredVoiceId,
      family_gentle: configuredVoiceId,
      family_cheerful: configuredVoiceId,
    };

    const voiceId = demoVoiceMap[voiceProfile] || configuredVoiceId;

    if (!apiKey || !voiceId) {
      return Response.json({ error: "Voice provider not configured" }, { status: 503 });
    }

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      return Response.json(
        { error: `ElevenLabs failed: ${errText}` },
        { status: 502 }
      );
    }

    const audioBuffer = await elevenResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Voice generation failed" },
      { status: 500 }
    );
  }
}
