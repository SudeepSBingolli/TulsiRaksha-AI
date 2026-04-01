"use client";

import { useEffect, useMemo, useState } from "react";

import GreetingCard from "./GreetingCard";
import Checklist from "./Checklist";
import ActivityChart from "./ActivityChart";
import QuickActions from "./QuickActions";
import HealthMetrics from "./HealthMetrics";

export default function Dashboard({ userName = "Appa", userId = null }) {
  const [demoStep, setDemoStep] = useState("idle");
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const stepLabel = useMemo(() => {
    const labels = {
      idle: "Ready",
      greeting: "Emotional start: Appa greeting",
      checklist: "Checklist shown",
      heart: "Live heart rate shown",
      alert: "High-risk alert popup",
      sos: "SOS highlighted",
      done: "Demo complete",
    };
    return labels[demoStep] || "Ready";
  }, [demoStep]);

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
    <section className="relative px-4 sm:px-6 lg:px-8 pb-32 sm:pb-40">
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-gray-500 font-medium">
              Demo: {stepLabel}
            </span>
            <button
              onClick={startDemo}
              disabled={isDemoRunning}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                isDemoRunning
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              }`}
            >
              {isDemoRunning ? "Running Demo..." : "Run Demo Flow"}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            <GreetingCard demoActive={demoStep === "greeting"} userName={userName} />
            <Checklist demoActive={demoStep === "checklist"} userId={userId} />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <ActivityChart />
            <HealthMetrics demoStep={demoStep} userName={userName} userId={userId} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            <QuickActions
              demoActive={demoStep === "sos"}
              autoTriggerSos={demoStep === "sos"}
            />
            <UpcomingReminders />
          </div>
        </div>
      </div>
    </section>
  );
}

function UpcomingReminders() {
  const reminders = [
    {
      time: "9:00 AM",
      label: "Morning Medicine",
      icon: "💊",
      status: "done",
    },
    {
      time: "11:00 AM",
      label: "Doctor Video Call",
      icon: "👨‍⚕️",
      status: "upcoming",
    },
    {
      time: "2:00 PM",
      label: "Afternoon Medicine",
      icon: "💊",
      status: "pending",
    },
    {
      time: "5:00 PM",
      label: "Evening Walk",
      icon: "🚶",
      status: "pending",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          Upcoming
        </h3>
        <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-colors ${
              reminder.status === "done"
                ? "bg-emerald-50/50 opacity-60"
                : reminder.status === "upcoming"
                ? "bg-amber-50 border border-amber-100"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl flex-shrink-0">{reminder.icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  reminder.status === "done"
                    ? "text-gray-400 line-through"
                    : "text-gray-800"
                }`}
              >
                {reminder.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{reminder.time}</p>
            </div>
            {reminder.status === "done" && (
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
            {reminder.status === "upcoming" && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}