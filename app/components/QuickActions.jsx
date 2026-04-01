"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useI18n } from "@/app/i18n";

export default function QuickActions({ demoActive = false, autoTriggerSos = false }) {
  const { t } = useI18n();
  const hasAutoTriggered = useRef(false);

  const actions = useMemo(() => [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      label: t("quickActions.callFamily"),
      emoji: "👨‍👩‍👧",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      label: t("quickActions.sos"),
      emoji: "🚨",
      color: "bg-red-50 hover:bg-red-100 text-red-600 border-red-100",
      isSos: true,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      label: t("quickActions.orderMeds"),
      emoji: "💊",
      color:
        "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-100",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      ),
      label: t("quickActions.playBhajan"),
      emoji: "🎵",
      color:
        "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-100",
    },
  ], [t]);

  const handleActionClick = useCallback((action) => {
    if (action.isSos) {
      alert(t("quickActions.emergencySent"));
    }
  }, [t]);

  useEffect(() => {
    if (!autoTriggerSos) {
      hasAutoTriggered.current = false;
      return;
    }

    if (hasAutoTriggered.current) return;

    const sosAction = actions.find((action) => action.isSos);
    if (sosAction) {
      hasAutoTriggered.current = true;
      handleActionClick(sosAction);
    }
  }, [autoTriggerSos, actions, handleActionClick]);

  return (
    <div
      className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-sm transition-all duration-500 ${
        demoActive
          ? "border-red-300 ring-4 ring-red-100 scale-[1.01]"
          : "border-gray-100"
      }`}
    >
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
        {t("quickActions.title")}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleActionClick(action)}
            className={`flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${action.color} group ${
              demoActive && action.isSos ? "ring-2 ring-red-300" : ""
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-xl">{action.emoji}</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}