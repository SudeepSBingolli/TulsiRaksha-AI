"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import GreetingCard from "./GreetingCard";
import Checklist from "./Checklist";
import ActivityChart from "./ActivityChart";
import QuickActions from "./QuickActions";
import HealthMetrics from "./HealthMetrics";
import EmotionVoiceCompanion from "./EmotionVoiceCompanion";
import VoiceAssistant from "./VoiceAssistant";
import WhatsAppNotify from "./WhatsAppNotify";
import { useI18n } from "@/app/i18n";

export default function Dashboard({ userName = "Appa", userId = null }) {
  const router = useRouter();
  const { t } = useI18n();
  const [demoStep, setDemoStep] = useState("idle");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [missedTasks, setMissedTasks] = useState([]);

  const stepLabel = useMemo(() => {
    const labels = {
      idle: t("dashboard.demoReady"),
      greeting: t("dashboard.demoGreeting"),
      checklist: t("dashboard.demoChecklist"),
      heart: t("dashboard.demoHeart"),
      alert: t("dashboard.demoAlert"),
      sos: t("dashboard.demoSos"),
      done: t("dashboard.demoDone"),
    };
    return labels[demoStep] || t("dashboard.demoReady");
  }, [demoStep, t]);

  useEffect(() => {
    if (!isDemoRunning) return;

    const timers = [
      setTimeout(() => setDemoStep("greeting"), 400),
      setTimeout(() => setDemoStep("checklist"), 2500),
      setTimeout(() => setDemoStep("heart"), 4500),
      setTimeout(() => setDemoStep("alert"), 7000),
      setTimeout(() => setDemoStep("sos"), 9500),
      setTimeout(() => {
        setDemoStep("done");
        setIsDemoRunning(false);
      }, 12000),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [isDemoRunning]);

  const startDemo = () => {
    setDemoStep("idle");
    setIsDemoRunning(true);
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-b from-emerald-50/30 via-white to-white">
      {/* ── Background decorations ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* ═══════════════════════════════════════
            HEADER SECTION
        ═══════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Demo Runner */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <span className="text-sm text-gray-500 hidden md:block">{t("dashboard.demoLabel")}</span>
            <span className="text-sm text-emerald-600 font-bold truncate max-w-[120px]">{stepLabel}</span>
            <button
              onClick={startDemo}
              disabled={isDemoRunning}
              className={`px-5 py-2 rounded-xl text-base font-bold transition-all ${
                isDemoRunning
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg"
              }`}
            >
              {isDemoRunning ? "⏳" : "▶️"} {t("dashboard.runDemo")}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 1: WELCOME
        ═══════════════════════════════════════ */}
        <div className="animate-in slide-in-from-bottom duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👋 {t("dashboard.title")}
          </h2>
          <GreetingCard demoActive={demoStep === "greeting"} userName={userName} />
        </div>

        {/* ═══════════════════════════════════════
            SECTION 2: HEALTH STATUS
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500 delay-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ❤️ {t("health.liveStatus")}
            </h2>
            <HealthMetrics demoStep={demoStep} userName={userName} userId={userId} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📊 {t("footer.features")}
            </h2>
            <ActivityChart />
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 3: DAILY TASKS + WHATSAPP ALERT
        ═══════════════════════════════════════ */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ✅ {t("checklist.title")}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checklist — sends missed tasks UP */}
            <Checklist
              demoActive={demoStep === "checklist"}
              userId={userId}
              onMissedTasksChange={setMissedTasks}
            />

            {/* WhatsApp Alert — receives missed tasks DOWN */}
            <WhatsAppNotify
              missedTasks={missedTasks}
              patientName={userName}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 4: QUICK HELP & VOICE
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500 delay-300">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🚨 {t("quickActions.title")}
            </h2>
            <QuickActions
              demoActive={demoStep === "sos"}
              autoTriggerSos={demoStep === "sos"}
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎙️ Voice Assistant
            </h2>
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/60 rounded-3xl p-6 sm:p-7 shadow-sm">
              <VoiceAssistant
                userName={userName}
                userId={userId}
                autoPlay={false}
                message={`Hi ${userName}! I'm here with you. How are you feeling today?`}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 5: EMOTION + FACE RECOGNITION
        ═══════════════════════════════════════ */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-[350ms]">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            😊 Emotion & Face Recognition
          </h2>
          <EmotionVoiceCompanion />
        </div>

        {/* ═══════════════════════════════════════
            SECTION 6: UPCOMING REMINDERS
        ═══════════════════════════════════════ */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-400">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⏰ {t("dashboard.upcoming")}
          </h2>
          <UpcomingReminders t={t} />
        </div>
      </div>
    </section>
  );
}

function UpcomingReminders({ t }) {
  const reminders = [
    {
      time: "9:00 AM",
      label: t("dashboard.reminderMorningMedicine"),
      icon: "💊",
      status: "done",
    },
    {
      time: "11:00 AM",
      label: t("dashboard.reminderDoctorCall"),
      icon: "👨‍️",
      status: "upcoming",
    },
    {
      time: "2:00 PM",
      label: t("dashboard.reminderAfternoonMedicine"),
      icon: "💊",
      status: "pending",
    },
    {
      time: "5:00 PM",
      label: t("dashboard.reminderEveningWalk"),
      icon: "🚶",
      status: "pending",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-lg shadow-gray-100/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t("dashboard.upcoming")}</h3>
        <button className="text-base text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
          {t("dashboard.viewAll")} →
        </button>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.01] ${
              reminder.status === "done"
                ? "bg-emerald-50 border-2 border-emerald-100 opacity-70"
                : reminder.status === "upcoming"
                ? "bg-amber-50 border-2 border-amber-200 shadow-sm"
                : "bg-white border-2 border-gray-100 hover:border-emerald-200 hover:shadow-md"
            }`}
          >
            <span className="text-3xl flex-shrink-0">{reminder.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-base sm:text-lg font-bold ${
                  reminder.status === "done"
                    ? "text-gray-400 line-through"
                    : "text-gray-800"
                }`}
              >
                {reminder.label}
              </p>
              <p className="text-sm text-gray-500 mt-1">{reminder.time}</p>
            </div>
            {reminder.status === "done" && (
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            )}
            {reminder.status === "upcoming" && (
              <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            )}
            {reminder.status === "pending" && (
              <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}