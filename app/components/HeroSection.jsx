"use client";

import { useI18n } from "@/app/i18n";

export default function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Ribbon / Leaf Motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main flowing ribbon */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[700px] opacity-[0.07]"
          viewBox="0 0 1400 700"
          fill="none"
        >
          <path
            d="M-100 400 C200 100, 400 600, 700 350 S1000 100, 1200 350 S1500 600, 1600 300"
            stroke="url(#ribbon1)"
            strokeWidth="120"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-50 500 C250 200, 450 650, 750 400 S1050 150, 1250 400 S1450 550, 1550 250"
            stroke="url(#ribbon2)"
            strokeWidth="80"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="ribbon2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating leaf elements */}
        <svg className="absolute top-16 left-[15%] w-16 h-16 opacity-[0.08] rotate-[-20deg]" viewBox="0 0 64 64" fill="#10b981">
          <path d="M32 4 C32 4, 56 20, 56 40 C56 54, 44 60, 32 60 C20 60, 8 54, 8 40 C8 20, 32 4, 32 4Z" />
          <line x1="32" y1="16" x2="32" y2="56" stroke="#fafbfd" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-20 right-[20%] w-12 h-12 opacity-[0.06] rotate-[30deg]" viewBox="0 0 64 64" fill="#10b981">
          <path d="M32 4 C32 4, 56 20, 56 40 C56 54, 44 60, 32 60 C20 60, 8 54, 8 40 C8 20, 32 4, 32 4Z" />
        </svg>
        <svg className="absolute top-32 right-[12%] w-8 h-8 opacity-[0.05] rotate-[60deg]" viewBox="0 0 64 64" fill="#10b981">
          <path d="M32 4 C32 4, 56 20, 56 40 C56 54, 44 60, 32 60 C20 60, 8 54, 8 40 C8 20, 32 4, 32 4Z" />
        </svg>

        {/* Subtle circle accents */}
        <div className="absolute top-24 right-[25%] w-3 h-3 rounded-full bg-emerald-300/20" />
        <div className="absolute bottom-32 left-[18%] w-4 h-4 rounded-full bg-emerald-300/15" />
        <div className="absolute top-40 left-[30%] w-2 h-2 rounded-full bg-emerald-400/20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8 sm:mb-10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-sm sm:text-base font-medium tracking-wide">
            {t("hero.badge")}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-gray-900 leading-[0.9] mb-6 sm:mb-8">
          Tulsi
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Raksha
          </span>
          <span className="text-emerald-500 ml-1 sm:ml-2 inline-block">AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14">
          {t("hero.sub1")} {" "}
          <span className="text-gray-600 font-normal">{t("hero.sub2")}</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <button className="group w-full sm:w-auto px-10 py-5 sm:py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-lg sm:text-xl font-semibold rounded-2xl shadow-xl shadow-emerald-200/50 hover:shadow-emerald-300/60 transition-all duration-300 flex items-center justify-center gap-3">
            <span>{t("hero.ctaPrimary")}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button className="w-full sm:w-auto px-10 py-5 sm:py-6 bg-white hover:bg-gray-50 text-gray-700 text-lg sm:text-xl font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            <span>{t("hero.ctaSecondary")}</span>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 sm:mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm sm:text-base font-medium">{t("hero.trustFamilies")}</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-sm sm:text-base font-medium">{t("hero.hipaa")}</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-medium">🇮🇳 {t("hero.madeInIndia")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}