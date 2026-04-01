"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getRiskFromML } from "@/lib/getRiskFromML";
import { useI18n } from "@/app/i18n";

function getRiskLevelFromRules({ heartRate, steps, sleep, medicine }) {
  if (heartRate > 110 && steps < 2500 && sleep < 5.5) return "HIGH";
  if (heartRate >= 105 && (steps < 3000 || sleep < 5)) return "HIGH";
  if (heartRate < 60 && steps >= 5000 && sleep >= 7 && medicine === 1) return "LOW";
  return "NORMAL";
}

export default function HealthMetrics({ demoStep = "idle", userName = "Appa", userId = null }) {
  const { t } = useI18n();
  const [heartRate, setHeartRate] = useState(92);
  const [steps, setSteps] = useState(4200);
  const [sleep, setSleep] = useState(7.1);
  const [medicine, setMedicine] = useState(1);
  const [riskLevel, setRiskLevel] = useState("NORMAL");
  const [lastUpdated, setLastUpdated] = useState("just now");
  const [isLoadingSensors, setIsLoadingSensors] = useState(true);
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [familyPhone, setFamilyPhone] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const highRiskVoiceTriggered = useRef(false);
  const autoOpenedWhatsApp = useRef(false);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const pushHealthSample = useCallback(
    async (sample, risk, source = "simulated") => {
      if (!userId) {
        setOfflineMode(true);
        return;
      }

      try {
        const payload = {
          user_id: userId,
          heart_rate: sample.heartRate,
          steps: sample.steps,
          sleep: sample.sleep,
          medicine: sample.medicine === 1,
          risk,
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
          .select("heart_rate, steps, sleep, medicine, risk, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data && mounted) {
          setHeartRate(data.heart_rate);
          setSteps(data.steps ?? 4200);
          setSleep(data.sleep ?? 7.1);
          setMedicine(data.medicine ? 1 : 0);
          setRiskLevel(data.risk || "NORMAL");
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
    let active = true;

    const loadFamilyPhone = async () => {
      if (!userId) {
        if (active) setFamilyPhone("");
        return;
      }

      const { data, error } = await supabase
        .from("user_details")
        .select("phone")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.warn("[HealthMetrics] Failed to load family contact", error.message);
        setFamilyPhone("");
        return;
      }

      setFamilyPhone(data?.phone || "");
    };

    loadFamilyPhone();

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const sample = {
        heartRate: Math.floor(Math.random() * 81) + 50,
        steps: Math.floor(Math.random() * 7001),
        sleep: Number((Math.random() * 6 + 3).toFixed(1)),
        medicine: Math.random() > 0.35 ? 1 : 0,
      };

      setHeartRate(sample.heartRate);
      setSteps(sample.steps);
      setSleep(sample.sleep);
      setMedicine(sample.medicine);

      const mlRisk = await getRiskFromML({
        heart_rate: sample.heartRate,
        steps: sample.steps,
        sleep: sample.sleep,
        medicine: sample.medicine,
      });

      const fallbackRisk = getRiskLevelFromRules(sample);
      const resolvedRisk = mlRisk || fallbackRisk;

      setRiskLevel(resolvedRisk);
      setLastUpdated("just now");

      pushHealthSample(sample, resolvedRisk);
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
          setSteps(payload.new.steps ?? 4200);
          setSleep(payload.new.sleep ?? 7.1);
          setMedicine(payload.new.medicine ? 1 : 0);
          setRiskLevel(payload.new.risk || "NORMAL");
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
      label: t("health.heartRate"),
      value: heartRate,
      unit: "BPM",
      icon: "❤️",
      color: "rose",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      trend: riskLevel.toLowerCase(),
    },
    {
      label: t("health.dailySteps"),
      value: steps,
      unit: "steps",
      icon: "🩺",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      trend: steps >= 4500 ? "normal" : "monitoring",
    },
    {
      label: t("health.sleep"),
      value: sleep,
      unit: "hrs",
      icon: "🩸",
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      trend: sleep >= 7 ? "normal" : "monitoring",
    },
    {
      label: t("health.medicine"),
      value: medicine,
      unit: medicine ? t("health.taken") : t("health.missed"),
      icon: "🫁",
      color: "emerald",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      trend: medicine ? "excellent" : "monitoring",
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
  const riskLabel =
    riskLevel === "HIGH"
      ? t("health.riskHigh")
      : riskLevel === "LOW"
      ? t("health.riskLow")
      : t("health.riskNormal");

  const trendLabel = (trend) => {
    if (trend === "high") return t("health.trendHigh");
    if (trend === "low") return t("health.trendLow");
    if (trend === "monitoring") return t("health.trendMonitoring");
    if (trend === "excellent") return t("health.trendExcellent");
    return t("health.trendNormal");
  };
  const riskColor =
    riskLevel === "HIGH"
      ? "text-red-700"
      : riskLevel === "LOW"
      ? "text-amber-700"
      : "text-emerald-700";
  const demoHighlight = demoStep === "heart" || demoStep === "alert";

  const whatsAppMessage = useMemo(() => [
    `Hello, this is an automated health update for ${userName}.`,
    `Heart Rate: ${heartRate} BPM`,
    `Steps: ${steps}`,
    `Sleep: ${sleep} hrs`,
    `Medicine: ${medicine ? "Taken" : "Missed"}`,
    `Status: ${riskLevel === "HIGH" ? "High Risk" : riskLevel === "LOW" ? "Normal" : "Monitoring Active"}`,
    `Risk Level: ${riskLevel}`,
    "Please check on them if needed.",
  ].join("\n"), [heartRate, medicine, riskLevel, sleep, steps, userName]);

  const normalizePhoneNumber = (phone) => {
    const digits = String(phone || "").replace(/[^\d]/g, "");
    return digits.length >= 10 ? digits : "";
  };

  const sendUpdateToFamily = useCallback(() => {
    try {
      const recipientPhone = normalizePhoneNumber(familyPhone);

      if (!recipientPhone) {
        throw new Error("Save a valid family contact phone number in your profile first.");
      }

      if (typeof window === "undefined") {
        throw new Error("WhatsApp can only be opened in a browser.");
      }

      const message = whatsAppMessage;
      const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setSendMessage("WhatsApp opened with the report ready to send.");
    } catch (error) {
      setSendMessage(error?.message || "Unable to open WhatsApp right now.");
    }
  }, [familyPhone, whatsAppMessage]);

  useEffect(() => {
    const shouldAutoOpen = riskLevel === "HIGH" && familyPhone && !autoOpenedWhatsApp.current;

    if (!shouldAutoOpen) {
      if (riskLevel !== "HIGH") {
        autoOpenedWhatsApp.current = false;
      }
      return;
    }

    const timer = setTimeout(() => {
      const recipientPhone = normalizePhoneNumber(familyPhone);
      if (!recipientPhone || typeof window === "undefined") return;

      const message = whatsAppMessage;
      const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setSendMessage("WhatsApp opened automatically with the report ready to send.");
      autoOpenedWhatsApp.current = true;
    }, 800);

    return () => clearTimeout(timer);
  }, [familyPhone, riskLevel, whatsAppMessage]);

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
            {t("health.title")}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-1">{t("health.lastUpdated")} {lastUpdated}</p>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100 active:scale-95">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {isLoadingSensors && (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-base font-semibold text-emerald-700">{t("health.connecting")}</p>
        </div>
      )}

      {riskLevel === "HIGH" && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-base sm:text-lg font-bold text-red-700">{t("health.highRisk")}</p>
          <p className="text-sm sm:text-base text-red-600 mt-1">{t("health.sitRelax")}</p>
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
        <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
          {t("health.liveStatus")}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-rose-700">❤️ {heartRate} BPM</p>
        <p className={`text-sm sm:text-base font-semibold mt-1 ${riskColor}`}>
          {t("health.risk")}: {riskLabel} {riskDot}
        </p>
        <p className="text-base sm:text-lg text-gray-700 mt-2 font-semibold">{t("health.status")}</p>
        <p className="text-sm text-emerald-700 mt-1 font-semibold">{t("health.safe")}</p>
        <p className={`text-xs sm:text-sm mt-2 font-semibold ${offlineMode ? "text-amber-700" : "text-emerald-700"}`}>
          {offlineMode ? t("health.offline") : t("health.synced")}
        </p>

        <button
          onClick={sendUpdateToFamily}
          className="mt-4 px-5 py-3 rounded-2xl text-base font-bold border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white transition-transform active:scale-[0.98]"
        >
          {t("health.sendUpdate")}
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
              {idx !== 0 ? (
                <span className="text-2xl">{metric.icon}</span>
              ) : (
                <span />
              )}
              <span
                className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg ${
                  trendColors[metric.trend] || trendColors.normal
                }`}
              >
                {trendLabel(metric.trend)}
              </span>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold ${metric.textColor} flex items-center`}
            >
              {idx === 0 && (
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
          <p className="text-base sm:text-lg font-bold text-red-700">{t("health.alertPopup")}</p>
          <p className="text-sm text-red-600 mt-1">
            {t("health.monitoringText")}
          </p>
        </div>
      )}
    </div>
  );
}