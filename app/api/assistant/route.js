export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !String(message).trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.COHERE_API_KEY;

    // Graceful fallback for demo mode when API key is not configured.
    if (!apiKey) {
      return Response.json(
        {
          reply:
            "I am with you. Please breathe slowly and take a sip of water. You are safe. ❤️",
          mode: "fallback",
        },
        { status: 200 }
      );
    }

    const prompt = `You are a caring assistant for elderly users. Respond kindly in 1-3 short sentences with simple words. User says: ${message}`;

    const cohereResp = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt,
        max_tokens: 90,
        temperature: 0.7,
        stop_sequences: ["\n\n"],
      }),
    });

    if (!cohereResp.ok) {
      const text = await cohereResp.text();
      return Response.json(
        { error: `Cohere API failed: ${text}` },
        { status: 502 }
      );
    }

    const data = await cohereResp.json();
    const reply = data?.generations?.[0]?.text?.trim();

    if (!reply) {
      return Response.json(
        {
          reply:
            "I am here with you. Tell me how you feel, and we will handle it together.",
          mode: "fallback",
        },
        { status: 200 }
      );
    }

    return Response.json({ reply, mode: "cohere" }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error.message || "Assistant error",
      },
      { status: 500 }
    );
  }
}
