export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !String(message).trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.COHERE_API_KEY;

    // Graceful fallback for demo mode when API key is not configured.
    if (!apiKey) {
      console.log("Checking API Key in backend: Key is UNDEFINED");
      return Response.json(
        {
          reply:
            "I am with you. Please breathe slowly and take a sip of water. You are safe. ❤️",
          mode: "fallback",
        },
        { status: 200 }
      );
    }

    // --- NEW COHERE CHAT API IMPLEMENTATION ---
    const cohereResp = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025", // <-- CHANGED THIS LINE TO THE NEWEST MODEL
        preamble: "You are a caring assistant for elderly users. Respond kindly in 1-3 short sentences with simple words. ALWAYS reply in the exact same language the user speaks to you.",
        message: message, 
        temperature: 0.7,
      }),
    });

    if (!cohereResp.ok) {
      const text = await cohereResp.text();
      // This will print to your VS Code terminal if Cohere rejects the request
      console.error("COHERE REJECTION REASON:", text); 
      return Response.json(
        { error: `Cohere API failed: ${text}` },
        { status: 502 }
      );
    }

    const data = await cohereResp.json();
    
    // Extracting the response text from the new Chat API format
    const reply = data?.text?.trim();

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
    console.error("Backend crash error:", error);
    return Response.json(
      {
        error: error.message || "Assistant error",
      },
      { status: 500 }
    );
  }
}