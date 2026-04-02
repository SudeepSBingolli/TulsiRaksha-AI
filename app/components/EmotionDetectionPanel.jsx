"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEmotionContext } from "@/context/emotionContext";

const MODEL_URL =
  "https://justadudewhohacks.github.io/face-api.js/models";

const EMOTION_META = {
  Sad: { emoji: "😔", color: "text-blue-700", bg: "bg-blue-50" },
  Depressed: { emoji: "😞", color: "text-indigo-700", bg: "bg-indigo-50" },
  Stressed: { emoji: "😣", color: "text-amber-700", bg: "bg-amber-50" },
  Happy: { emoji: "🙂", color: "text-emerald-700", bg: "bg-emerald-50" },
  Neutral: { emoji: "😐", color: "text-gray-700", bg: "bg-gray-100" },
};

function mapExpressionToEmotion(expressions) {
  if (!expressions) return { emotion: "Neutral", topExpression: "none", confidence: 0 };

  const entries = Object.entries(expressions || {});
  const [topExpression, confidence] =
    entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0] || ["none", 0];

  const sadScore = Number(expressions.sad || 0);
  const stressScore = Math.max(
    Number(expressions.angry || 0),
    Number(expressions.fearful || 0),
    Number(expressions.disgusted || 0)
  );
  const happyScore = Number(expressions.happy || 0);

  let emotion = "Neutral";
  if (sadScore >= 0.6) emotion = "Depressed";
  else if (sadScore >= 0.28) emotion = "Sad";
  else if (stressScore >= 0.3) emotion = "Stressed";
  else if (happyScore >= 0.45) emotion = "Happy";

  return { emotion, topExpression, confidence: Number(confidence || 0) };
}

export default function EmotionDetectionPanel({ onEmotionChange }) {
  const videoRef = useRef(null);
  const { updateEmotion } = useEmotionContext();
  const [emotion, setEmotion] = useState("Neutral");
  const [modelReady, setModelReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [error, setError] = useState("");
  const [expressionInfo, setExpressionInfo] = useState({ topExpression: "none", confidence: 0 });
  const [retryKey, setRetryKey] = useState(0);

  const meta = useMemo(() => EMOTION_META[emotion] || EMOTION_META.Neutral, [emotion]);

  useEffect(() => {
    let mounted = true;
    let stream = null;
    let intervalId = null;

    function startFallback(message) {
      setFallbackMode(true);
      if (message) setError(message);

      intervalId = window.setInterval(() => {
        const samples = ["Neutral", "Neutral", "Sad", "Stressed", "Depressed"];
        const nextEmotion = samples[Math.floor(Math.random() * samples.length)];
        setEmotion(nextEmotion);
        updateEmotion(nextEmotion, "fallback");
        onEmotionChange?.(nextEmotion);
      }, 3000);
    }

    async function getCameraStream() {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    function cameraErrorMessage(err) {
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        return "Camera permission is blocked. Please allow camera access in browser settings, then tap Retry Camera.";
      }
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        return "No camera was found on this device.";
      }
      if (name === "NotReadableError" || name === "TrackStartError") {
        return "Camera is busy in another app. Close other camera apps and tap Retry Camera.";
      }
      return "Unable to access camera. Tap Retry Camera to try again.";
    }

    async function initialize() {
      setError("");
      setModelReady(false);
      setCameraReady(false);
      setFallbackMode(false);

      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          startFallback("Camera API is not supported in this browser.");
          return;
        }

        const faceapi = await import("face-api.js");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        if (!mounted) return;
        setModelReady(true);

        try {
          stream = await getCameraStream();
        } catch (cameraErr) {
          startFallback(cameraErrorMessage(cameraErr));
          return;
        }

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraReady(true);

        intervalId = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;

          try {
            const detection = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
              )
              .withFaceExpressions();

            const mapped = mapExpressionToEmotion(detection?.expressions);
            setEmotion(mapped.emotion);
            setExpressionInfo({ topExpression: mapped.topExpression, confidence: mapped.confidence });
            updateEmotion(mapped.emotion, "camera");
            onEmotionChange?.(mapped.emotion);
          } catch {
            // Keep panel responsive even if a frame fails.
          }
        }, 900);
      } catch {
        startFallback("Emotion model load failed. Running in demo fallback mode.");
      }
    }

    initialize();

    return () => {
      mounted = false;
      if (intervalId) window.clearInterval(intervalId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onEmotionChange, retryKey, updateEmotion]);

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Emotion Detection Panel</h3>
      <p className="text-sm text-gray-600 mt-1">
        Real-time webcam emotion tracking for elder well-being.
      </p>

      <div className="mt-4 mx-auto w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-emerald-100 bg-black/80">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          muted
          autoPlay
          playsInline
        />
      </div>

      <div className={`mt-4 rounded-2xl px-4 py-3 ${meta.bg}`}>
        <p className={`text-lg font-semibold ${meta.color}`}>
          Emotion: {emotion} {meta.emoji}
        </p>
        {!fallbackMode && (
          <p className="text-xs text-gray-500 mt-1">
            Detected: {expressionInfo.topExpression} ({Math.round(expressionInfo.confidence * 100)}%)
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {modelReady && cameraReady && !fallbackMode
            ? "ML model + camera active"
            : fallbackMode
            ? "Demo fallback active"
            : "Initializing model..."}
        </p>
      </div>

      {error && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {error}
          </p>
          <button
            onClick={() => setRetryKey((v) => v + 1)}
            className="w-full rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2.5 transition"
          >
            Retry Camera
          </button>
        </div>
      )}
    </div>
  );
}
