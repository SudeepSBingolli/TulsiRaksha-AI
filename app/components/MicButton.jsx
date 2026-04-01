"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function MicButton() {
  const [preferredLang] = useState(() => {
    if (typeof window === "undefined") return "kn-IN";

    const browserLang = (navigator.language || "").toLowerCase();
    if (browserLang.startsWith("kn")) return "kn-IN";
    if (browserLang.startsWith("hi")) return "hi-IN";
    if (browserLang.startsWith("en")) return "en-US";

    return "kn-IN";
  });
  const [voices, setVoices] = useState([]);
  const waveHeights = [16, 24, 20, 28, 18, 26, 22];
  const [isListening, setIsListening] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [micError, setMicError] = useState("");
  const [isMicSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getVoiceForLang = useCallback(
    (lang) => {
      if (!voices.length) return null;

      const primary = voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith(lang.toLowerCase().split("-")[0])
      );
      if (primary) return primary;

      const fallbackOrder = ["kn", "hi", "en"];
      for (const code of fallbackOrder) {
        const fallback = voices.find((voice) =>
          voice.lang?.toLowerCase().startsWith(code)
        );
        if (fallback) return fallback;
      }

      return voices[0] || null;
    },
    [voices]
  );

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setPulseScale(1 + Math.random() * 0.3);
    }, 200);
    return () => clearInterval(interval);
  }, [isListening]);

  const speak = useCallback(
    (text, lang = preferredLang) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        console.warn("Speech synthesis not supported");
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();
      synth.resume();

      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = lang;
      msg.rate = 0.9;
      msg.pitch = 1;
      msg.volume = 1;

      const selectedVoice = getVoiceForLang(lang);
      if (selectedVoice) {
        msg.voice = selectedVoice;
      }

      try {
        synth.speak(msg);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
        const fallbackMsg = new SpeechSynthesisUtterance(text);
        fallbackMsg.lang = "en-US";
        fallbackMsg.rate = 0.9;
        fallbackMsg.pitch = 1;
        fallbackMsg.volume = 1;
        try {
          synth.speak(fallbackMsg);
        } catch (e2) {
          console.warn("Fallback speech failed:", e2);
        }
      }
    },
    [getVoiceForLang, preferredLang]
  );

  const handleCommand = useCallback(
    (text) => {
      const normalized = text.toLowerCase();

      if (normalized.includes("medicine") || text.includes("ಔಷಧ") || text.includes("दवा")) {
        let response = "Please take your medicine with water";
        let lang = "en-US";
        if (text.includes("ಔಷಧ")) {
          response = "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಔಷಧ ಮತ್ತು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ";
          lang = "kn-IN";
        } else if (text.includes("दवा")) {
          response = "कृपया पानी के साथ अपनी दवा लें";
          lang = "hi-IN";
        }
        setResponseText(response);
        speak(response, lang);
        return;
      }

      if (normalized.includes("help") || normalized.includes("emergency") || normalized.includes("danger") || text.includes("ಸಹಾಯ") || text.includes("मदद")) {
        let response = "I am here for you. I will help. Stay calm.";
        let lang = "en-US";
        if (text.includes("ಸಹಾಯ")) {
          response = "ನಾನು ನಿನ್ನ ಸಂಗಯಲ್ಲಿ ಇದ್ದೇನೆ. ವಿಚಾರವಿಲ್ಲ, ನಾವು ಹೋಗುತ್ತೇವೆ.";
          lang = "kn-IN";
        } else if (text.includes("मदद")) {
          response = "मैं आपके साथ हूँ। चिंता मत करो। सब ठीक है।";
          lang = "hi-IN";
        }
        setResponseText(response);
        speak(response, lang);
        return;
      }

      if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("how are you") || normalized.includes("good morning") || normalized.includes("good afternoon")) {
        const response = "Hello! I am Tulsi, your health assistant. I am here to help you stay healthy and happy.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("water") || normalized.includes("drink") || normalized.includes("thirsty")) {
        const response = "Please drink a glass of water. It is important to stay hydrated. Your health is my priority.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("blood pressure") || normalized.includes("sugar") || normalized.includes("temperature") || normalized.includes("health")) {
        const response = "Please check your health regularly. If you feel unwell, let me know immediately. Your well-being matters.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("sleep") || normalized.includes("rest") || normalized.includes("tired") || normalized.includes("sleepy")) {
        const response = "Please get some rest. Good sleep is important for your health. Sleep well!";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("food") || normalized.includes("eat") || normalized.includes("meal") || normalized.includes("hungry")) {
        const response = "Please have a healthy meal. Eat nutritious food like fruits, vegetables, and plenty of water. Eat on time.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("family") || normalized.includes("call") || normalized.includes("lonesome") || normalized.includes("alone")) {
        const response = "You can call your family members. Do not hesitate to reach out. They care about you.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      if (normalized.includes("pain") || normalized.includes("hurt") || normalized.includes("problem")) {
        const response = "If you have any pain or problem, please tell me. We can get proper help for you.";
        setResponseText(response);
        speak(response, "en-US");
        return;
      }

      const response = "I am listening. Please speak slowly and clearly. I am here to help you with your health and wellness.";
      setResponseText(response);
      speak(response, "en-US");
    },
    [speak]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = preferredLang;

    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      if (!latest?.[0]?.transcript) return;

      const text = latest[0].transcript.trim();
      setTranscript(text);
      handleCommand(text);
    };

    recognition.onerror = (event) => {
      setMicError(`Microphone error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      recognitionRef.current = null;
    };
  }, [preferredLang, handleCommand]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setMicError("Microphone is not supported in this browser.");
      return;
    }

    try {
      setMicError("");
      setTranscript("");
      setResponseText("");
      window.speechSynthesis?.resume();
      setIsListening(true);
      recognitionRef.current.start();
      speak("ತುಳಸಿ ಕೇಳುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮಾತನಾಡಿ.", "kn-IN");
    } catch (err) {
      console.warn("Mic start error:", err);
      setMicError("Unable to start microphone. Please allow microphone access.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTimeout(() => setShowPanel(false), 500);
  };

  const handleMicClick = () => {
    if (!isListening) {
      setShowPanel(true);
      startListening();
    } else {
      stopListening();
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
            🎤 Speak to Tulsi
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
            aria-label={isListening ? "Stop listening" : "Start listening"}
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
          className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 translate-y-0 opacity-100`}
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
                {isMicSupported
                  ? "Speak now. Kannada, Hindi, and English commands are supported."
                  : "Microphone not supported. Use quick command buttons below."}
              </p>

              {transcript && (
                <p className="mt-3 text-center text-sm sm:text-base font-semibold text-emerald-700">
                  Heard: {transcript}
                </p>
              )}

              {responseText && (
                <p className="mt-2 text-center text-sm sm:text-base font-semibold text-gray-700">
                  Tulsi: {responseText}
                </p>
              )}

              {micError && (
                <p className="mt-3 text-center text-sm font-semibold text-red-600">
                  {micError}
                </p>
              )}

              {/* Quick voice commands */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <button
                  onClick={() => {
                    recognitionRef.current?.stop();
                    handleCommand("medicine");
                    setTimeout(() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (e) {
                          console.warn("Restart recognition error:", e);
                        }
                      }
                    }, 800);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  💊 Medicine
                </button>
                <button
                  onClick={() => {
                    recognitionRef.current?.stop();
                    handleCommand("help");
                    setTimeout(() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (e) {
                          console.warn("Restart recognition error:", e);
                        }
                      }
                    }, 800);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  🛡️ Help
                </button>
                <button
                  onClick={() => {
                    recognitionRef.current?.stop();
                    handleCommand("hello");
                    setTimeout(() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (e) {
                          console.warn("Restart recognition error:", e);
                        }
                      }
                    }, 800);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-600 transition-colors border border-gray-100"
                >
                  👋 Greeting
                </button>
                <button
                  onClick={() => speak("Can you hear me now?", "en-US")}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-medium text-emerald-700 transition-colors border border-emerald-200"
                >
                  🔊 Test Speaker
                </button>
                <button
                  onClick={() => stopListening()}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-600 transition-colors border border-red-200"
                >
                  ✖️ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
