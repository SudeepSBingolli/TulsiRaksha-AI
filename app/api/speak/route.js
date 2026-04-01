import { ElevenLabsClient } from "elevenlabs";

export async function POST(request) {
  try {
    const { text, voiceId, userVoiceId } = await request.json();

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

    const client = new ElevenLabsClient({ apiKey });

    // Use user's cloned voice if available, otherwise use default voice
    const selectedVoiceId = userVoiceId || voiceId || "EXAVITQu4vLvkujnVJL5";

    // Generate speech from text
    const audioStream = await client.generate({
      voice: selectedVoiceId,
      text: text,
      model_id: "eleven_multilingual_v2",
    });

    // Convert stream to Buffer
    const audioBuffer = Buffer.from(await audioStream.arrayBuffer());

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length,
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
