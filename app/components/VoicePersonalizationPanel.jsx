"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/app/i18n";
import { supabase } from "@/lib/supabaseClient";
import { VOICE_PROFILES } from "@/lib/personalizedVoice";

export default function VoicePersonalizationPanel({
  userId,
  selectedVoice,
  onVoiceChange,
  customText,
  onTextChange,
  onPlayFamilyVoice,
  onComfort,
  speaking,
  lastMode,
  providerConfigured,
}) {
  const { t } = useI18n();
  const [showPanel, setShowPanel] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [voiceDescription, setVoiceDescription] = useState("");
  const [greeting, setGreeting] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  // Fetch existing preferences
  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("user_voice_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences(data);
          setConsentGiven(data.consent_given || false);
          setVoiceDescription(data.voice_description || "");
          setGreeting(data.preferred_greeting || "");
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleConsentChange = (e) => {
    setConsentGiven(e.target.checked);
  };

  const handleSavePreferences = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("user_voice_preferences")
        .upsert([
          {
            user_id: userId,
            consent_given: consentGiven,
            voice_description: voiceDescription,
            preferred_greeting: greeting,
            consent_date: consentGiven ? new Date() : null,
          },
        ])
        .select();

      if (error) throw error;

      setUploadStatus("Preferences saved successfully!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setUploadStatus("Error saving preferences");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Main Panel */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Voice Personalization</h3>
        <p className="text-sm text-gray-600 mt-1">
          Customize your voice experience with consent-based preferences
        </p>
      </div>

      {/* Consent Section */}
      <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
        <h4 className="font-semibold text-gray-900">Voice Usage Consent</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          By enabling voice personalization, you consent to TulsiRaksha AI using your preferences to create a warm, familiar voice. Your data is encrypted and never shared.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={handleConsentChange}
            className="w-5 h-5 rounded border-emerald-300 text-emerald-600"
          />
          <span className="text-sm font-medium text-gray-700">
            I consent to voice personalization
          </span>
        </label>
      </div>

      {/* Voice Preferences */}
      <div className="space-y-4">
        {/* Select Voice */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Voice (Demo)
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {VOICE_PROFILES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Voice Characteristics
          </label>
          <textarea
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            placeholder="E.g., Warm and reassuring like my son, calm and gentle..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
            rows={2}
          />
        </div>

        {/* Custom Greeting */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Custom Greeting (Optional)
          </label>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="How should the assistant greet you?"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
          />
        </div>

        {/* Voice Message Demo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Voice Message Demo
          </label>
          <textarea
            value={customText}
            onChange={(e) => onTextChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Appa, please take your medicine ❤️"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onPlayFamilyVoice}
          disabled={speaking}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 transition"
        >
          {speaking ? "Playing..." : "🎙️ Play Voice"}
        </button>

        <button
          onClick={onComfort}
          disabled={speaking}
          className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:bg-gray-100 text-emerald-700 font-semibold py-3 transition"
        >
          💚 Comfort Me
        </button>

        <button
          onClick={handleSavePreferences}
          disabled={isLoading}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold py-3 transition"
        >
          {isLoading ? "Saving..." : "💾 Save"}
        </button>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            uploadStatus.includes("saved")
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {uploadStatus}
        </div>
      )}

      {/* Info */}
      <div className="space-y-2 text-xs text-gray-500">
        <p>
          Provider: {providerConfigured ? "✅ ElevenLabs configured" : "⚠️ Using browser voice"}
        </p>
        <p>
          Mode: {lastMode === "elevenlabs" ? "🎙️ ElevenLabs API" : "🔊 Browser TTS"}
        </p>
      </div>
    </div>
  );
}
