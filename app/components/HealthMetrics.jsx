"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getRiskLevel(rate) {
  if (rate > 110) return "HIGH";
  if (rate < 50) return "LOW";
  return "NORMAL";
}

export default function HealthMetrics({ demoStep = "idle", userName = "Appa", userId = null }) {
  const [heartRate, setHeartRate] = useState(92);
  const [lastUpdated, setLastUpdated] = useState("just now");
  const [isLoadingSensors, setIsLoadingSensors] = useState(true);
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const highRiskVoiceTriggered = useRef(false);

  const riskLevel = useMemo(() => getRiskLevel(heartRate), [heartRate]);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const pushHealthSample = useCallback(
    async (rate, source = "simulated") => {
      if (!userId) {
        setOfflineMode(true);
        return;
      }

      try {
        const payload = {
          user_id: userId,
          heart_rate: rate,
          risk: getRiskLevel(rate),
          source,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("health_data").insert(payload);
        if (error) throw error;
        setOfflineMode(false);
      } catch (error) {
        console.warn("[HealthMetrics] Offline sample mode", error?.message || error);
        setOfflineMode(true);
      }
    },
    [userId]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSensors(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadLatest = async () => {
      if (!userId) {
        setOfflineMode(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("health_data")
          .select("heart_rate, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data && mounted) {
          setHeartRate(data.heart_rate);
          setLastUpdated("just now");
        }

        setOfflineMode(false);
      } catch (error) {
        console.warn("[HealthMetrics] Fetch unavailable, using local simulation", error?.message || error);
        setOfflineMode(true);
      }
    };

    loadLatest();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextRate = Math.floor(Math.random() * 70) + 45;
      setHeartRate(nextRate);
      setLastUpdated("just now");
      pushHealthSample(nextRate);
    }, 3000);

    return () => clearInterval(interval);
  }, [pushHealthSample]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("health_data_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "health_data" },
        (payload) => {
          if (payload.new.user_id !== userId) return;
          setHeartRate(payload.new.heart_rate);
          setLastUpdated("just now");
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setOfflineMode(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const metrics = [
    {
      label: "Heart Rate",
      value: heartRate,
      unit: "BPM",
      icon: "❤️",
      color: "rose",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      trend: riskLevel.toLowerCase(),
    },
    {
      label: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      icon: "🩺",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      trend: "slightly high",
    },
    {
      label: "Blood Sugar",
      value: "142",
      unit: "mg/dL",
      icon: "🩸",
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      trend: "monitoring",
    },
    {
      label: "SpO₂ Level",
      value: "97",
      unit: "%",
      icon: "🫁",
      color: "emerald",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      trend: "excellent",
    },
  ];

  const trendColors = {
    normal: "text-emerald-600 bg-emerald-50",
    low: "text-amber-700 bg-amber-50",
    high: "text-red-700 bg-red-50",
    "slightly high": "text-amber-600 bg-amber-50",
    monitoring: "text-orange-600 bg-orange-50",
    excellent: "text-emerald-600 bg-emerald-50",
  };

  const riskDot = riskLevel === "HIGH" ? "🔴" : riskLevel === "LOW" ? "🟡" : "🟢";
  const riskColor =
    riskLevel === "HIGH"
      ? "text-red-700"
      : riskLevel === "LOW"
      ? "text-amber-700"
      : "text-emerald-700";
  const demoHighlight = demoStep === "heart" || demoStep === "alert";

  const sendUpdateToFamily = useCallback(() => {
    const message = `TulsiRaksha Alert\nUser: ${userName}\nHeart Rate: ${heartRate} BPM\nRisk: ${riskLevel}\nStatus: Monitoring Active`;
    console.log("[TulsiRaksha] Simulated family update:\n", message);
    setSendMessage("Update logged in console (simulated send).");
  }, [heartRate, riskLevel, userName]);

  useEffect(() => {
    if (riskLevel === "HIGH") {
      setShowRiskPopup(true);
      if (!highRiskVoiceTriggered.current) {
        highRiskVoiceTriggered.current = true;
        speak("Please sit down and relax");
      }
      return;
    }

    setShowRiskPopup(false);
    highRiskVoiceTriggered.current = false;
  }, [riskLevel, speak]);

  return (
    <div
      className={`elder-card bg-white rounded-3xl border p-6 sm:p-7 shadow-sm transition-all duration-500 ${
        demoHighlight
          ? "border-rose-300 ring-4 ring-rose-100 scale-[1.01]"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Health Vitals
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">Last updated {lastUpdated}</p>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100 active:scale-95">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {isLoadingSensors && (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-base font-semibold text-emerald-700">Connecting to health sensors...</p>
        </div>
      )}

      {riskLevel === "HIGH" && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-base sm:text-lg font-bold text-red-700">⚠️ High Risk Detected</p>
          <p className="text-sm sm:text-base text-red-600 mt-1">Please sit down and relax. Family can be notified now.</p>
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
        <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
          Live Health Status
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-rose-700">❤️ {heartRate} BPM</p>
        <p className={`text-sm sm:text-base font-semibold mt-1 ${riskColor}`}>
          Risk: {riskLevel} {riskDot}
        </p>
        <p className="text-base sm:text-lg text-gray-700 mt-2 font-semibold">Status: Monitoring Active</p>
        <p className="text-sm text-emerald-700 mt-1 font-semibold">You are safe ❤️</p>
        <p className={`text-xs sm:text-sm mt-2 font-semibold ${offlineMode ? "text-amber-700" : "text-emerald-700"}`}>
          {offlineMode ? "Offline mode" : "Synced with Supabase"}
        </p>

        <button
          onClick={sendUpdateToFamily}
          className="mt-4 px-5 py-3 rounded-2xl text-base font-bold border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white transition-transform active:scale-[0.98]"
        >
          Send Update to Family
        </button>

        {sendMessage && <p className="text-sm mt-2 font-semibold text-emerald-700">{sendMessage}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`${metric.bgColor} rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              {metric.label !== "Heart Rate" ? (
                <span className="text-2xl">{metric.icon}</span>
              ) : (
                <span />
              )}
              <span
                className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg ${
                  trendColors[metric.trend] || trendColors.normal
                }`}
              >
                {metric.trend}
              </span>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold ${metric.textColor} flex items-center`}
            >
              {metric.label === "Heart Rate" && (
                <span className="text-2xl sm:text-3xl mr-2">{metric.icon}</span>
              )}
              {metric.value}
              <span className="text-sm sm:text-base font-normal ml-1 opacity-60">
                {metric.unit}
              </span>
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      {showRiskPopup && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 animate-pulse">
          <p className="text-base sm:text-lg font-bold text-red-700">🔴 ALERT POPUP</p>
          <p className="text-sm text-red-600 mt-1">
            Please sit down and relax. We are monitoring you continuously.
          </p>
        </div>
      )}
    </div>
  );
}