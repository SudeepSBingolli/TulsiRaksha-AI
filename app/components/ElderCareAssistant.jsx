"use client";

import { useMemo, useState } from "react";

function speakText(text, onStart, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1;

  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();

  window.speechSynthesis.speak(u);
}

export default function ElderCareAssistant({ userName = "Appa" }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hello ${userName}, how are you feeling today? ❤️`,
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendMessage = async () => {
    if (!canSend) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const resp = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await resp.json();
      const reply =
        data?.reply ||
        "I am here with you. Let us take one step at a time. You are not alone.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      speakText(reply, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } catch {
      const fallback = "I am here with you. Please take a calm breath. You are safe. ❤️";
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
      speakText(fallback, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 bg-white border border-emerald-100 rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold flex items-center justify-center ${
            isSpeaking ? "animate-pulse" : ""
          }`}
        >
          AI
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tulsi Companion AI</h2>
          <p className="text-sm text-gray-600">Friendly support for elders</p>
        </div>
      </div>

      <div className="bg-[#F9FAF5] border border-emerald-100 rounded-2xl p-4 h-72 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
              m.role === "assistant"
                ? "bg-white text-gray-800 border border-emerald-100"
                : "ml-auto bg-emerald-500 text-white"
            }`}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white text-gray-600 border border-emerald-100">
            Tulsi is thinking...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="How are you feeling today?"
          className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <button
          onClick={sendMessage}
          disabled={!canSend}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-5 py-3 transition"
        >
          Send
        </button>
      </div>
    </section>
  );
}
