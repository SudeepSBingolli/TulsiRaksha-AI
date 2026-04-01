"use client";

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useI18n } from "@/app/i18n";

const MicButton = forwardRef((props, ref) => {
  const { t } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech Recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError("");
        setTranscript("");
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + " ");
          } else {
            interim += transcript;
          }
        }
        if (interim) {
          setTranscript((prev) => prev.split(" ").slice(0, -1).join(" ") + " " + interim);
        }
      };

      recognition.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setShowPanel(true);
      setTranscript("");
      setError("");
      recognitionRef.current.start();

      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 30000);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isListening]);

  const closePanel = useCallback(() => {
    stopListening();
    setShowPanel(false);
    setTranscript("");
  }, [stopListening]);

  // Expose control methods to parent components
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
  }), [startListening, stopListening]);

  return (
    <>
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6">
            {/* Close Button */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              🎙️ {t("voice.title") || "Voice Assistant"}
            </h2>

            {/* Listening Indicator */}
            {isListening ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎤</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  {t("voice.listening") || "Listening..."}
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={startListening}
                  className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg transition-all"
                >
                  🎤
                </button>
              </div>
            )}

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4 min-h-20 border border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isListening ? (
                <button
                  onClick={stopListening}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  {t("voice.stop") || "Stop"}
                </button>
              ) : (
                <button
                  onClick={startListening}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  {t("voice.start") || "Start"}
                </button>
              )}
              <button
                onClick={closePanel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                {t("voice.close") || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

MicButton.displayName = "MicButton";

export default MicButton;