"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EmotionDetectionPanel from "./EmotionDetectionPanel";
import VoicePersonalizationPanel from "./VoicePersonalizationPanel";
import MicButton from "./MicButton";
import {
  getVoiceProviderStatus,
  playPersonalizedVoice,
} from "@/lib/personalizedVoice";
import { useEmotionContext } from "@/context/emotionContext";

const SAD_COMFORT_TEXT = "You are not alone. I am with you. Please take a deep breath. ❤️";

export default function EmotionVoiceCompanion() {
  const {
    emotion,
    supportMessage,
    familyVoice,
    setFamilyVoice,
    voiceOptions,
    emotionHistory,
    isSupportiveEmotion,
  } = useEmotionContext();

  const [selectedVoice, setSelectedVoice] = useState("family_warm");
  const [customText, setCustomText] = useState("Appa, please take your medicine ❤️");
  const [speaking, setSpeaking] = useState(false);
  const [lastMode, setLastMode] = useState("browser-tts");
  const [providerConfigured, setProviderConfigured] = useState(false);

  const recentEmotionHistory = useMemo(() => {
    return [...emotionHistory].slice(-5).reverse();
  }, [emotionHistory]);

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

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className={`bg-white rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-sm transition-all ${isSupportiveEmotion ? "ring-2 ring-rose-200" : ""}`}>
        <p className="text-sm sm:text-base font-semibold text-gray-800">
          Real-time emotion status: <span className="text-emerald-700">{emotion}</span>
        </p>
        {supportMessage && (
          <p className="mt-2 text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            {supportMessage}
          </p>
        )}

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-gray-700 font-medium">
            Family voice for auto support
            <select
              value={familyVoice}
              onChange={(e) => setFamilyVoice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-gray-800"
            >
              {voiceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => playVoice(SAD_COMFORT_TEXT)}
            className="self-end rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-4 py-2 transition"
          >
            Test Support Voice
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
          <p className="text-xs font-semibold text-emerald-800">Emotion History</p>
          <div className="mt-2 space-y-1">
            {recentEmotionHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No emotion data yet.</p>
            ) : (
              recentEmotionHistory.map((entry, index) => (
                <p key={`${entry.timestamp}-${index}`} className="text-xs text-gray-600">
                  {entry.emotion} at {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      <EmotionDetectionPanel />

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
