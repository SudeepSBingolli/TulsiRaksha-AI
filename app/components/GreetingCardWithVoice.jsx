/**
 * GreetingCard Voice Integration Example
 * Shows how to add voice greetings to existing dashboard
 * 
 * This is a template showing the integration pattern
 * Apply similar logic to your greeting component
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/i18n";
import { getGreeting } from "@/lib/voiceHealthIntegration";
import VoiceAssistant from "./VoiceAssistant";

export default function GreetingCardWithVoice({ userName = "Appa", userId }) {
  const { t } = useI18n();
  const [showVoiceGreeting, setShowVoiceGreeting] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const voiceTimeoutRef = useRef(null);

  // Automatically trigger voice greeting after a short delay
  useEffect(() => {
    if (!userId) return;

    // Delay to allow UI to render first
    voiceTimeoutRef.current = setTimeout(() => {
      const greeting = getGreeting(userName);
      setVoiceMessage(greeting);
      setShowVoiceGreeting(true);
    }, 500);

    return () => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, [userId, userName]);

  const handleDismissVoice = () => {
    setShowVoiceGreeting(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Text Greeting */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {t("greeting.hello")} {userName}👋
        </h2>
        <p className="text-gray-600 mt-2">
          {t("greeting.subtitle") ||
            "Welcome back! Here's your health status overview."}
        </p>
      </div>

      {/* Voice Greeting Section */}
      {showVoiceGreeting && (
        <div className="border-t border-emerald-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              Voice Assistant
            </h3>
            <button
              onClick={handleDismissVoice}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dismiss
            </button>
          </div>

          <VoiceAssistant
            userName={userName}
            userId={userId}
            autoPlay={true}
            message={voiceMessage}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">
            Status
          </p>
          <p className="text-lg font-bold text-emerald-900 mt-1">
            {t("greeting.monitoring")} ✅
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">
            {t("greeting.lastSync")}
          </p>
          <p className="text-lg font-bold text-emerald-900 mt-1">2 min ago</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">
            Health
          </p>
          <p className="text-lg font-bold text-emerald-900 mt-1">Good</p>
        </div>
      </div>
    </div>
  );
}
