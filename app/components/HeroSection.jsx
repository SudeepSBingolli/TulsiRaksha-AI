"use client";

import Button from "./ui/Button";
import Card from "./ui/Card";
import { useI18n } from "@/app/i18n";

export default function HeroSection() {
  const { t } = useI18n();

  const features = [
    {
      icon: "🎙️",
      title: "Voice Assistant",
      description: "Simple voice guidance in familiar language for reminders and safety.",
    },
    {
      icon: "📈",
      title: "Health Monitoring",
      description: "Live health tracking with clear alerts and family notifications.",
    },
    {
      icon: "💊",
      title: "Medicine Support",
      description: "Timely reminders with easy-to-understand check-ins.",
    },
  ];

  const benefits = [
    "Large and readable interface",
    "One-tap actions for quick help",
    "Calm and reassuring visual design",
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/45 blur-3xl animate-pulse" />
        <div className="absolute top-36 -right-20 h-64 w-64 rounded-full bg-emerald-100/65 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <Card className="p-7 sm:p-10 lg:p-12 bg-gradient-to-br from-emerald-50 to-white border-emerald-200/90 fade-in-up">
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm sm:text-base font-semibold text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              TulsiRaksha AI
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-700">
              Never Alone. Always Cared For.
            </p>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-700 leading-relaxed">
              A warm and simple care companion for elders. Health monitoring, voice guidance,
              and family support in one easy experience.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">
              <Button href="/login" className="text-lg sm:text-xl px-8 py-4">
                Get Started
              </Button>
              <Button variant="secondary" className="text-lg sm:text-xl px-8 py-4">
                <span aria-hidden>🎙️</span>
                Voice Assistant
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 text-base sm:text-lg">
              <span className="rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-emerald-700 font-semibold">
                You are safe ❤️
              </span>
              <span className="rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-emerald-700 font-semibold">
                Monitoring active
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="fade-in"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <Card className="bg-white/90">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Benefits for Elders
            </h3>
            <ul className="space-y-3">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200/90">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Family Connection
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-5">
              Share updates with family members and caregivers, so everyone stays informed and
              connected with peace of mind.
            </p>
            <Button href="/family" variant="ghost" className="text-lg self-start">
              Explore Family Features
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}