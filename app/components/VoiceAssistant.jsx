"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/i18n";
import { supabase } from "@/lib/supabaseClient";

export default function VoiceAssistant({
  userName = "Friend",
  userId = null,
  autoPlay = false,
  message = null,
}) {
  const { t } = useI18n();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(100);
  const [displayText, setDisplayText] = useState(message || "");
  const [voicePreferences, setVoicePreferences] = useState(null);

  // Fetch user's voice preferences on mount
  useEffect(() => {
    if (!userId) return;

    const fetchVoicePreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("user_voice_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        // If no preferences exist, create default
        if (!data) {
          const { data: newData, error: insertError } = await supabase
            .from("user_voice_preferences")
            .insert([{ user_id: userId }])
            .select()
            .maybeSingle();

          if (!insertError) setVoicePreferences(newData);
        } else {
          setVoicePreferences(data);
        }
      } catch (error) {
        // Table may not exist yet - silently continue with default preferences
        console.debug("Voice preferences unavailable, using defaults");
      }
    };

    fetchVoicePreferences();
  }, [userId]);

  // Generate and play voice
  const generateAndPlayVoice = async (textToSpeak) => {
    if (!textToSpeak) return;

    setIsLoading(true);
    setDisplayText(textToSpeak);

    try {
      // Try ElevenLabs API first
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          userVoiceId: voicePreferences?.custom_voice_id,
          voiceId: voicePreferences?.voice_id,
        }),
      });

      if (response.ok) {
        // ElevenLabs succeeded
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.volume = volume / 100;
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        // ElevenLabs failed, use browser fallback
        console.warn("ElevenLabs API failed, using browser speech synthesis fallback");
        useBrowserSpeechSynthesis(textToSpeak);
      }
    } catch (error) {
      console.warn("Voice generation error, using browser fallback:", error);
      // Fallback to browser speech synthesis
      useBrowserSpeechSynthesis(textToSpeak);
    }
  };

  // Browser speech synthesis fallback
  const useBrowserSpeechSynthesis = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = volume / 100;
      utterance.onend = () => setIsPlaying(false);
      utterance.onstart = () => setIsPlaying(true);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      console.error("Speech synthesis not supported in this browser");
      setIsLoading(false);
    }
  };

  // Auto-play greeting on component mount if enabled
  useEffect(() => {
    if (autoPlay && !isPlaying && voicePreferences && !message) {
      const greeting =
        voicePreferences.preferred_greeting ||
        `Hi ${userName}! I am here with you. How are you feeling today?`;
      generateAndPlayVoice(greeting);
    }
  }, [autoPlay, voicePreferences, userName, isPlaying, message]);

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleReplay = () => {
    if (displayText) {
      generateAndPlayVoice(displayText);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* AI Indicator & Disclosure */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 w-fit">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-medium text-emerald-700">
          {t("voice.aiGenerated") || "AI-Generated Voice"}
        </span>
      </div>

      {/* Voice Display Text */}
      {displayText && (
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <p className="text-sm text-gray-700 leading-relaxed">{displayText}</p>
        </div>
      )}

      {/* Audio Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading || !displayText}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : isPlaying ? (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Replay Button */}
        <button
          onClick={handleReplay}
          disabled={isLoading || !displayText}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-600 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
          title="Replay voice"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 min-w-fit">{volume}%</span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
