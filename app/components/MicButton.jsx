"use client";

import { useState, useEffect } from "react";

export default function MicButton() {
  const [waveHeights] = useState(() =>
    Array.from({ length: 7 }, () => 16 + Math.random() * 32)
  );
  const [isListening, setIsListening] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setPulseScale(1 + Math.random() * 0.3);
    }, 200);
    return () => clearInterval(interval);
  }, [isListening]);

  const speak = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.92;
    msg.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const runVoiceAction = (type) => {
    if (type === "medicine") {
      speak("Medicine reminder. Please take your tablet with water.");
      return;
    }

    if (type === "safety") {
      speak("You are safe. Please sit down and relax.");
      return;
    }

    speak("Good Afternoon Appa. You are doing great today.");
  };

  const handleMicClick = () => {
    if (!isListening) {
      speak("Voice assistant started");
      setShowPanel(true);
      setTimeout(() => setIsListening(true), 100);
    } else {
      speak("Voice assistant stopped");
      setIsListening(false);
      setTimeout(() => setShowPanel(false), 300);
    }
  };

  return (
    <>
      {/* Floating Mic Button */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        {/* Label */}
        <div
          className={`px-5 py-2.5 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-500 ${showPanel
              ? "opacity-0 translate-y-4 scale-90"
              : "opacity-100 translate-y-0 scale-100"
            }`}
        >
          <p className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Speak to Tulsi
          </p>
        </div>

        {/* Mic Button with Pulse Rings */}
        <div className="relative">
          {/* Pulse rings when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 -m-2 sm:-m-3 rounded-full bg-emerald-400/20 animate-ping" />
              <div
                className="absolute inset-0 rounded-full bg-emerald-400/10 transition-transform duration-200"
                style={{
                  transform: `scale(${pulseScale + 0.5})`,
                  width: "100%",
                  height: "100%",
                  margin: "-10%",
                  padding: "10%",
                }}
              />
            </>
          )}

          <button
            onClick={handleMicClick}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isListening
                ? "bg-red-500 hover:bg-red-600 shadow-red-300/50 scale-110"
                : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-300/50 hover:scale-105"
              }`}
          >
            {isListening ? (
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Voice Interaction Panel */}
      {showPanel && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 ${isListening
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
            }`}
        >
          <div className="max-w-lg mx-auto px-4 pb-32 sm:pb-36">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8">
              {/* Animated wave */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500 rounded-full"
                    style={{
                      height: `${h}px`,
                      animation: `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              <p className="text-center text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Listening...
              </p>
              <p className="text-center text-sm sm:text-base text-gray-400">
                Voice-first assistant for elder care support
              </p>

              {/* Quick voice commands */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <button
                  onClick={() => runVoiceAction("medicine")}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  💊 Medicine Reminder
                </button>
                <button
                  onClick={() => runVoiceAction("safety")}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  🛡️ Safety Message
                </button>
                <button
                  onClick={() => runVoiceAction("greeting")}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  👋 Greeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
     
    </>
  );
}