"use client";

const VOICE_LABELS = {
  family_warm: "Family Warm",
  family_gentle: "Family Gentle",
  family_cheerful: "Family Cheerful",
};

export const VOICE_PROFILES = Object.keys(VOICE_LABELS).map((id) => ({
  id,
  label: VOICE_LABELS[id],
}));

export async function getVoiceProviderStatus() {
  try {
    const response = await fetch("/api/voice", { method: "GET" });
    if (!response.ok) return { configured: false };
    const data = await response.json();
    return { configured: Boolean(data?.configured) };
  } catch {
    return { configured: false };
  }
}

function fallbackSpeak(text, lang = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve({ ok: false, mode: "none" });
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onend = () => resolve({ ok: true, mode: "browser-tts" });
    utterance.onerror = () => resolve({ ok: false, mode: "browser-tts" });

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playPersonalizedVoice({
  text,
  voiceProfile = "family_warm",
  lang = "en-US",
  useApi = true,
}) {
  if (!useApi) {
    return await fallbackSpeak(text, lang);
  }

  try {
    const response = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceProfile }),
    });

    if (!response.ok) {
      return await fallbackSpeak(text, lang);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error("Audio playback failed"));
      };
      audio.play().catch(reject);
    });

    return { ok: true, mode: "elevenlabs" };
  } catch {
    return await fallbackSpeak(text, lang);
  }
}
