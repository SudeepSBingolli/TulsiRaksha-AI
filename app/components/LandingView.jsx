"use client";

import { useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n";
import Card from "./ui/Card";
import MicButton from "./MicButton";

export default function LandingView() {
  const { t } = useI18n();
  const micRef = useRef(null);

  const features = [
    {
      icon: "🎙️",
      title: t("landing.featureVoiceTitle"),
      desc: t("landing.featureVoiceDesc"),
    },
    {
      icon: "📈",
      title: t("landing.featureHealthTitle"),
      desc: t("landing.featureHealthDesc"),
    },
    {
      icon: "💊",
      title: t("landing.featureMedicineTitle"),
      desc: t("landing.featureMedicineDesc"),
    },
  ];

  const benefits = [
    t("landing.benefit1"),
    t("landing.benefit2"),
    t("landing.benefit3"),
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 overflow-hidden">
      {/* ── Soft background blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-emerald-50/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10 sm:space-y-14">
        {/* ═══════════════════════════════════════
            HERO CARD — matches the screenshot
        ═══════════════════════════════════════ */}
        <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-white p-8 sm:p-12 lg:p-16 shadow-[0_4px_40px_-12px_rgba(16,185,129,0.12)]">
          <div className="flex flex-col items-center text-center space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-white px-5 py-2 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm sm:text-base font-semibold text-emerald-700">
                {t("landing.badge")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              TulsiRaksha AI
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700">
              {t("landing.subtitle1")} {t("landing.subtitle2")}
            </p>

            {/* Description */}
            <p className="max-w-2xl text-base sm:text-lg text-gray-500 leading-relaxed">
              {t("landing.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-200/60 hover:bg-emerald-600 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
              >
                {t("landing.getStarted")}
              </Link>

              <button
                onClick={() => micRef.current?.startListening()}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-emerald-200 bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.98] transition-all duration-200"
              >
                🎙️ {t("landing.voiceAssistant")}
              </button>
            </div>

            {/* Status pills */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <span className="rounded-2xl border border-emerald-100 bg-white px-5 py-2 text-sm sm:text-base text-emerald-700 font-semibold shadow-sm">
                {t("landing.youAreSafe")}
              </span>
              <span className="rounded-2xl border border-emerald-100 bg-white px-5 py-2 text-sm sm:text-base text-emerald-700 font-semibold shadow-sm">
                {t("landing.monitoringActive")}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            FEATURE CARDS
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            BENEFITS + FAMILY
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="rounded-2xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("landing.benefitsTitle")}
            </h3>
            <ul className="space-y-3">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-base text-gray-600"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("landing.familyTitle")}
            </h3>
            <p className="text-base text-gray-500 leading-relaxed mb-5">
              {t("landing.familyDesc")}
            </p>
            <Link
              href="/login"
              className="inline-flex text-base text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors"
            >
              {t("landing.familyLink")} →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Floating MicButton (hidden, activated via ref) ── */}
      <MicButton ref={micRef} />
    </section>
  );
}