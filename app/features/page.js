"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function FeaturesPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: "🎙️",
      title: t("landing.featureVoiceTitle"),
      desc: t("landing.featureVoiceDesc"),
      details: "Talk naturally in your language. Our AI assistant understands and responds instantly.",
    },
    {
      icon: "📈",
      title: t("landing.featureHealthTitle"),
      desc: t("landing.featureHealthDesc"),
      details: "Monitor your vitals in real-time with intelligent health tracking and risk detection.",
    },
    {
      icon: "💊",
      title: t("landing.featureMedicineTitle"),
      desc: t("landing.featureMedicineDesc"),
      details: "Smart reminders and adherence tracking to ensure you never miss a dose.",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Alerts",
      desc: "Keep family members informed",
      details: "Automatic emergency alerts and health reports sent to family via WhatsApp.",
    },
    {
      icon: "🤖",
      title: "AI Companion",
      desc: "24/7 intelligent support",
      details: "Your personal health companion available anytime, anywhere with emotional support.",
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      desc: "Track health patterns",
      details: "Deep insights into your health trends, predictive risk assessment, and personalized recommendations.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F9FAF5] overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
              Powerful Features
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything you need for comprehensive health monitoring and care
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-emerald-100/80 bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>

                    {/* Details */}
                    <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {feature.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-3xl border border-emerald-200 p-12 sm:p-16 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of seniors using TulsiRaksha AI for better health management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-600 transition-all duration-200"
              >
                Get Started Today
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-emerald-300 bg-white px-8 py-4 text-lg font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
