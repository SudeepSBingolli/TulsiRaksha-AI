"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EmotionDetectionPanel from "./EmotionDetectionPanel";
import VoicePersonalizationPanel from "./VoicePersonalizationPanel";
import MicButton from "./MicButton";
import {
  getVoiceProviderStatus,
  playPersonalizedVoice,
} from "@/lib/personalizedVoice";

const SAD_COMFORT_TEXT = "You are not alone. I am with you. Please take a deep breath. ❤️";
const HAPPY_TEXT = "You're doing great today!";

export default function EmotionVoiceCompanion() {
  const [emotion, setEmotion] = useState("Neutral");
  const [selectedVoice, setSelectedVoice] = useState("family_warm");
  const [customText, setCustomText] = useState("Appa, please take your medicine ❤️");
  const [comfortMessage, setComfortMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [lastMode, setLastMode] = useState("browser-tts");
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const lastSadTriggerRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadProviderStatus() {
      const status = await getVoiceProviderStatus();
      if (active) {
        setProviderConfigured(status.configured);
      }
    }

    loadProviderStatus();

    return () => {
      active = false;
    };
  }, []);

  const playVoice = useCallback(
    async (text) => {
      setSpeaking(true);
      const result = await playPersonalizedVoice({
        text,
        voiceProfile: selectedVoice,
        lang: "en-US",
        useApi: providerConfigured,
      });
      setLastMode(result.mode || "browser-tts");
      setSpeaking(false);
    },
    [providerConfigured, selectedVoice]
  );

  const handleEmotionChange = useCallback(
    async (nextEmotion) => {
      setEmotion(nextEmotion);

      if (nextEmotion === "Happy") {
        setComfortMessage(HAPPY_TEXT);
        return;
      }

      if (nextEmotion !== "Sad") return;

      const now = Date.now();
      if (now - lastSadTriggerRef.current < 20000) {
        setComfortMessage("Comfort mode is active. You are safe and supported.");
        return;
      }

      lastSadTriggerRef.current = now;
      if (!voiceEnabled) {
        setComfortMessage(
          "Sad mood detected. Tap Enable Voice once to allow comforting voice playback."
        );
        return;
      }

      setComfortMessage(SAD_COMFORT_TEXT);
      await playVoice(SAD_COMFORT_TEXT);
    },
    [playVoice, voiceEnabled]
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
        <p className="text-sm sm:text-base font-semibold text-gray-800">
          Real-time emotion status: <span className="text-emerald-700">{emotion}</span>
        </p>
        {comfortMessage && (
          <p className="mt-2 text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            {comfortMessage}
          </p>
        )}
        <div className="mt-3">
          <button
            onClick={async () => {
              setVoiceEnabled(true);
              await playVoice("Voice assistant is ready. I am here with you.");
            }}
            className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-4 py-2 transition"
          >
            {voiceEnabled ? "Voice Enabled" : "Enable Voice"}
          </button>
        </div>
      </div>

      <EmotionDetectionPanel onEmotionChange={handleEmotionChange} />

      <VoicePersonalizationPanel
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        customText={customText}
        onTextChange={setCustomText}
        onPlayFamilyVoice={() => playVoice(customText)}
        onComfort={() => playVoice(SAD_COMFORT_TEXT)}
        speaking={speaking}
        lastMode={lastMode}
        providerConfigured={providerConfigured}
      />

      <MicButton />
    </div>
  );
}
