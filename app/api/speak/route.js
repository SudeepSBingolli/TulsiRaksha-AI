/**
 * Text-to-Speech API Endpoint
 * Converts text to speech using ElevenLabs API
 * 
 * POST /api/speak
 * Body: { text, voiceId, userVoiceId }
 * Returns: Audio stream (MP3)
 */

export async function POST(request) {
  try {
    const { text, voiceId, userVoiceId } = await request.json();

    // Validate input
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "ElevenLabs API key not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use user's cloned voice if available, otherwise use default voice
    const selectedVoiceId = userVoiceId || voiceId || "EXAVITQu4vLvkujnVJL5";

    // Call ElevenLabs API directly
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.json();
      throw new Error(`ElevenLabs API error: ${JSON.stringify(errorData)}`);
    }

    // Get audio buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate speech",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
