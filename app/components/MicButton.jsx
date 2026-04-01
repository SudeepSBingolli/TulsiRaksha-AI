"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const RESPONSE_BOOK = {
  "en-US": {
    greeting: [
      "Hello! I am Tulsi. I am with you.",
      "Good to hear your voice. How can I help right now?",
    ],
    medicine: [
      "Please take your medicine with a glass of water. You are doing great.",
      "Medicine time reminder: take your tablet slowly and safely.",
    ],
    help: [
      "I am here with you. Please stay calm. Would you like me to guide you to call family?",
      "You are not alone. Take a deep breath. I can help you contact support.",
    ],
    water: [
      "Please drink water now. Small sips are perfectly fine.",
      "Hydration check: please drink one glass of water.",
    ],
    sleep: [
      "Please rest for some time. Good sleep helps your heart and mind.",
      "Try to relax and rest. I can remind you again in a little while.",
    ],
    food: [
      "Please have a light healthy meal. Eating on time helps your strength.",
      "Nutritious food is important. Please do not skip your meal.",
    ],
    health: [
      "Please check your blood pressure or sugar if possible. I am monitoring with you.",
      "Thank you for checking your health. Tell me if you feel discomfort.",
    ],
    family: [
      "Your family cares for you deeply. Shall I help you call them?",
      "You can connect with your family now. Staying connected is comforting.",
    ],
    pain: [
      "I am sorry you are uncomfortable. Please sit down and breathe slowly.",
      "Please take rest. If pain continues, we should contact family or doctor.",
    ],
    fallback: [
      "I am listening. Please speak slowly and clearly, for example: medicine, help, or call family.",
      "I am here for your safety. You can say: medicine reminder, I need help, or call family.",
    ],
  },
  "kn-IN": {
    greeting: [
      "ನಮಸ್ಕಾರ, ನಾನು ತುಳಸಿ. ನಾನು ನಿಮ್ಮ ಜೊತೆ ಇದ್ದೇನೆ.",
      "ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿ ಸಂತೋಷವಾಗಿದೆ. ನಿಮಗೆ ಏನು ಸಹಾಯ ಬೇಕು?",
    ],
    medicine: [
      "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಔಷಧವನ್ನು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
      "ಔಷಧ ಸಮಯವಾಗಿದೆ. ನಿಧಾನವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
    ],
    help: [
      "ನಾನು ನಿಮ್ಮ ಜೊತೆ ಇದ್ದೇನೆ. ದಯವಿಟ್ಟು ಶಾಂತವಾಗಿರಿ. ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಬೇಕೇ?",
      "ನೀವು ಒಬ್ಬರೇ ಇಲ್ಲ. ಆಳವಾಗಿ ಉಸಿರಾಡಿ. ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    ],
    water: [
      "ದಯವಿಟ್ಟು ಈಗ ಒಂದು ಗ್ಲಾಸ್ ನೀರು ಕುಡಿಯಿರಿ.",
      "ಜಲಯುಕ್ತವಾಗಿರಿ. ಚಿಕ್ಕ ಸಿಪ್‌ಗಳಲ್ಲಿ ನೀರು ಕುಡಿಯಿರಿ.",
    ],
    sleep: [
      "ಸ್ವಲ್ಪ ವಿಶ್ರಾಂತಿ ಮಾಡಿ. ಒಳ್ಳೆಯ ನಿದ್ರೆ ಆರೋಗ್ಯಕ್ಕೆ ಮುಖ್ಯ.",
      "ದಯವಿಟ್ಟು ನೆಮ್ಮದಿಯಾಗಿ ಮಲಗಿ. ಬೇಕಾದರೆ ಮತ್ತೆ ಜ್ಞಾಪನೆ ಕೊಡುತ್ತೇನೆ.",
    ],
    food: [
      "ಸಮಯಕ್ಕೆ ಊಟ ಮಾಡಿ. ಪೋಷಕಾಂಶಯುತ ಆಹಾರ ತಿನ್ನಿ.",
      "ಹಲ್ಕಾ ಆರೋಗ್ಯಕರ ಆಹಾರ ತೆಗೆದುಕೊಳ್ಳಿ.",
    ],
    health: [
      "ಸಾಧ್ಯವಿದ್ದರೆ BP ಅಥವಾ sugar ಪರಿಶೀಲಿಸಿ.",
      "ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ ಚೆನ್ನಾಗಿದೆ. ಅಸ್ವಸ್ಥ ಅನ್ನಿಸಿದರೆ ತಕ್ಷಣ ಹೇಳಿ.",
    ],
    family: [
      "ನಿಮ್ಮ ಕುಟುಂಬ ನಿಮ್ಮ ಬಗ್ಗೆ ಕಾಳಜಿ ಇಟ್ಟುಕೊಂಡಿದೆ. ಅವರಿಗೆ ಕರೆ ಮಾಡೋಣವೇ?",
      "ಕುಟುಂಬದವರ ಜೊತೆ ಮಾತನಾಡಿದರೆ ನಿಮಗೆ ನೆಮ್ಮದಿ ಸಿಗುತ್ತದೆ.",
    ],
    pain: [
      "ಕ್ಷಮಿಸಿ. ನೀವು ಕುಳಿತು ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ.",
      "ನೋವು ಮುಂದುವರೆದರೆ ಕುಟುಂಬ ಅಥವಾ ವೈದ್ಯರಿಗೆ ತಿಳಿಸೋಣ.",
    ],
    fallback: [
      "ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ. ಉದಾಹರಣೆ: ಔಷಧ, ಸಹಾಯ, ಕುಟುಂಬಕ್ಕೆ ಕರೆ.",
      "ನಿಮ್ಮ ಸುರಕ್ಷತೆ ನನ್ನ ಮುಖ್ಯತೆ. ಔಷಧ ಜ್ಞಾಪನೆ ಅಥವಾ ಸಹಾಯ ಎಂದೂ ಹೇಳಬಹುದು.",
    ],
  },
  "hi-IN": {
    greeting: [
      "नमस्ते, मैं तुलसी हूँ। मैं आपके साथ हूँ।",
      "आपकी आवाज़ सुनकर अच्छा लगा। मैं कैसे मदद करूँ?",
    ],
    medicine: [
      "कृपया अपनी दवा पानी के साथ लें।",
      "दवा का समय हो गया है। आराम से दवा लें।",
    ],
    help: [
      "मैं आपके साथ हूँ। कृपया शांत रहें। क्या परिवार को कॉल करें?",
      "आप अकेले नहीं हैं। गहरी सांस लें। मैं मदद करूँगी।",
    ],
    water: [
      "कृपया अभी एक गिलास पानी पिएँ।",
      "हाइड्रेट रहना ज़रूरी है। धीरे-धीरे पानी पिएँ।",
    ],
    sleep: [
      "कृपया थोड़ा आराम करें। अच्छी नींद से स्वास्थ्य बेहतर रहता है।",
      "आराम कीजिए। चाहें तो मैं थोड़ी देर बाद फिर याद दिलाऊँगी।",
    ],
    food: [
      "कृपया समय पर हल्का और पौष्टिक भोजन लें।",
      "खाना न छोड़ें। नियमित भोजन आपके लिए अच्छा है।",
    ],
    health: [
      "संभव हो तो BP या शुगर जाँच लें।",
      "स्वास्थ्य जाँच अच्छी आदत है। असुविधा हो तो तुरंत बताइए।",
    ],
    family: [
      "आपका परिवार आपकी बहुत परवाह करता है। क्या उन्हें कॉल करें?",
      "परिवार से बात करने से मन हल्का होता है।",
    ],
    pain: [
      "मुझे दुख है कि आपको तकलीफ है। कृपया बैठकर आराम करें।",
      "यदि दर्द जारी रहे तो परिवार या डॉक्टर से संपर्क करें।",
    ],
    fallback: [
      "मैं सुन रही हूँ। धीरे और साफ बोलिए: दवा, मदद, या परिवार को कॉल।",
      "आप सुरक्षित हैं। आप कह सकते हैं: दवा याद दिलाओ, मदद चाहिए, परिवार को कॉल।",
    ],
  },
};

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function detectTextLanguage(text, fallbackLang) {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  return fallbackLang;
}

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
  const [recognitionLang, setRecognitionLang] = useState(preferredLang);
  const [showRetry, setShowRetry] = useState(false);
  const [offlineVoiceMode, setOfflineVoiceMode] = useState(false);
  const [networkErrorCount, setNetworkErrorCount] = useState(0);
  const [typedCommand, setTypedCommand] = useState("");
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

  const getReply = useCallback(
    (text) => {
      const normalized = text.toLowerCase();
      const lang = detectTextLanguage(text, preferredLang);
      const book = RESPONSE_BOOK[lang] || RESPONSE_BOOK["en-US"];

      const intents = {
        medicine: ["medicine", "tablet", "pill", "ಔಷಧ", "दवा"],
        help: ["help", "emergency", "danger", "sos", "ಸಹಾಯ", "मदद", "इमरजेंसी"],
        greeting: ["hello", "hi", "good morning", "good afternoon", "good evening", "ನಮಸ್ಕಾರ", "नमस्ते"],
        water: ["water", "drink", "thirsty", "ನೀರು", "पानी"],
        health: ["blood pressure", "bp", "sugar", "temperature", "health", "ಆರೋಗ್ಯ", "स्वास्थ्य"],
        sleep: ["sleep", "rest", "tired", "sleepy", "ನಿದ್ರೆ", "नींद"],
        food: ["food", "eat", "meal", "hungry", "ಊಟ", "खाना", "भोजन"],
        family: ["family", "call", "alone", "lonesome", "ಕುಟುಂಬ", "परिवार"],
        pain: ["pain", "hurt", "problem", "ನೋವು", "दर्द", "तकलीफ"],
      };

      const intent = Object.keys(intents).find((key) =>
        intents[key].some((word) => normalized.includes(word))
      );

      const category = intent || "fallback";
      return { text: pickRandom(book[category]), lang };
    },
    [preferredLang]
  );

  const handleCommand = useCallback(
    (text) => {
      const reply = getReply(text);
      setResponseText(reply.text);
      speak(reply.text, reply.lang);
    },
    [getReply, speak]
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
    recognition.lang = recognitionLang;

    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      if (!latest?.[0]?.transcript) return;

      const text = latest[0].transcript.trim();
      setTranscript(text);
      handleCommand(text);
    };

    recognition.onerror = (event) => {
      const knownErrors = {
        "not-allowed": "Microphone access is blocked. Please allow microphone permission.",
        "audio-capture": "No microphone detected. Please check your device microphone.",
        "network": "Network issue while listening. Please try again.",
      };

      if (event.error === "network") {
        const nextCount = networkErrorCount + 1;
        setNetworkErrorCount(nextCount);
        setShowRetry(true);

        if (nextCount >= 2) {
          setOfflineVoiceMode(true);
          setIsListening(false);
          setMicError(
            "Speech network is unavailable on this browser. Offline Voice Mode is active — use quick buttons or type a command below."
          );
          return;
        }

        // Fallback to a stable recognition language after network failures
        // while preserving multilingual voice replies.
        if (recognitionLang !== "en-US") {
          setRecognitionLang("en-US");
          setMicError(
            "Network issue in current language. Switched mic recognition to English for stability. Tap Retry."
          );
          return;
        }
      }

      setMicError(knownErrors[event.error] || `Microphone error: ${event.error}`);
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
  }, [handleCommand, networkErrorCount, recognitionLang]);

  const startListening = () => {
    if (offlineVoiceMode) {
      setMicError(
        "Offline Voice Mode is active. Use quick buttons or typed command below."
      );
      setShowPanel(true);
      return;
    }

    if (!recognitionRef.current) {
      setMicError("Microphone is not supported in this browser.");
      return;
    }

    try {
      setMicError("");
      setShowRetry(false);
      setTranscript("");
      setResponseText("");
      window.speechSynthesis?.resume();
      setIsListening(true);
      recognitionRef.current.start();
      const startPrompts = {
        "en-US": "Tulsi is listening. Please speak.",
        "kn-IN": "ತುಳಸಿ ಕೇಳುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮಾತನಾಡಿ.",
        "hi-IN": "तुलसी सुन रही है। कृपया बोलिए।",
      };
      speak(startPrompts[preferredLang] || startPrompts["en-US"], preferredLang);
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
                {isListening ? "Listening..." : "Tap mic to continue"}
              </p>
              <p className="text-center text-sm sm:text-base text-gray-400">
                {isMicSupported
                  ? offlineVoiceMode
                    ? "Offline Voice Mode: use quick buttons or type your command."
                    : "Speak now. Kannada, Hindi, and English are supported with friendly guidance."
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

              {showRetry && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => {
                      if (offlineVoiceMode) {
                        setOfflineVoiceMode(false);
                        setNetworkErrorCount(0);
                      }
                      stopListening();
                      setTimeout(() => {
                        setShowPanel(true);
                        startListening();
                      }, 250);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                  >
                    Retry Mic
                  </button>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={typedCommand}
                  onChange={(e) => setTypedCommand(e.target.value)}
                  placeholder="Type command (medicine/help/water)"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <button
                  onClick={() => {
                    if (!typedCommand.trim()) return;
                    handleCommand(typedCommand.trim());
                    setTranscript(typedCommand.trim());
                    setTypedCommand("");
                  }}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-2 text-sm"
                >
                  Send
                </button>
              </div>

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
                    handleCommand("water");
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
                  💧 Water
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
                  onClick={() => {
                    recognitionRef.current?.stop();
                    handleCommand("call family");
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
                  📞 Family
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
