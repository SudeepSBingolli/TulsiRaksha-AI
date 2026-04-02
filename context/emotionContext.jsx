"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const VOICE_OPTIONS = [
  { id: "mother", label: "Mother" },
  { id: "father", label: "Father" },
  { id: "son", label: "Son" },
];

const SUPPORT_MESSAGES = {
  Sad: "You are not alone. I am here for you. ❤️",
  Depressed: "It's okay to feel this way. We love you and we are with you. ❤️",
  Stressed: "Take a deep breath. Everything will be okay. 🌿",
};

const SUPPORTIVE_EMOTIONS = new Set(["Sad", "Depressed", "Stressed"]);

const EmotionContext = createContext(null);

const MAX_HISTORY = 50;

export function EmotionProvider({ children }) {
  const [emotion, setEmotion] = useState("Neutral");
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [familyVoice, setFamilyVoice] = useState("mother");
  const [supportTrigger, setSupportTrigger] = useState(null);
  const triggerIdRef = useRef(0);

  const updateEmotion = useCallback((newEmotion, source = "camera") => {
    setEmotion(newEmotion);
    setEmotionHistory((prev) => {
      const updated = [...prev, { emotion: newEmotion, timestamp: Date.now(), source }];
      return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
    });

    if (SUPPORTIVE_EMOTIONS.has(newEmotion)) {
      setSupportTrigger({
        id: ++triggerIdRef.current,
        message: SUPPORT_MESSAGES[newEmotion] || "We are here for you. ❤️",
      });
    }
  }, []);

  const isSupportiveEmotion = SUPPORTIVE_EMOTIONS.has(emotion);
  const supportMessage = SUPPORT_MESSAGES[emotion] || null;

  return (
    <EmotionContext.Provider
      value={{
        emotion,
        supportMessage,
        familyVoice,
        setFamilyVoice,
        voiceOptions: VOICE_OPTIONS,
        emotionHistory,
        isSupportiveEmotion,
        supportTrigger,
        updateEmotion,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotionContext() {
  const ctx = useContext(EmotionContext);
  if (!ctx) {
    throw new Error("useEmotionContext must be used within an EmotionProvider");
  }
  return ctx;
}
