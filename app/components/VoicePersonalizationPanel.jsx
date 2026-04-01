"use client";

import { VOICE_PROFILES } from "@/lib/personalizedVoice";

export default function VoicePersonalizationPanel({
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
  return (
    <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Voice Personalization Panel</h3>
      <p className="text-sm text-gray-600 mt-1">
        Family voice cloning concept (API + fallback browser voice).
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Family Voice (Demo)
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Voice Message</label>
          <textarea
            value={customText}
            onChange={(e) => onTextChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Appa, please take your medicine ❤️"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onPlayFamilyVoice}
            disabled={speaking}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 transition"
          >
            {speaking ? "Playing..." : "Play Family Voice"}
          </button>

          <button
            onClick={onComfort}
            disabled={speaking}
            className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:bg-gray-100 text-emerald-700 font-semibold py-3 transition"
          >
            Comfort Me
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Provider: {providerConfigured ? "ElevenLabs configured" : "ElevenLabs not configured (using browser voice)"}
        </p>
        <p className="text-xs text-gray-500">
          Current audio mode: {lastMode === "elevenlabs" ? "ElevenLabs" : "Browser TTS fallback"}
        </p>
        <p className="text-xs text-gray-500">
          Tip: click Enable Voice once before using auto comfort playback.
        </p>
      </div>
    </div>
  );
}
