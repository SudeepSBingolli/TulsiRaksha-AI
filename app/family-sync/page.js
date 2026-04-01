"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function FamilySyncPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: "🔔",
      title: "Real-time Alerts",
      desc: "Instant notifications when health metrics go out of normal range",
    },
    {
      icon: "📊",
      title: "Health Reports",
      desc: "Daily/weekly health summary sent automatically to family members",
    },
    {
      icon: "💬",
      title: "WhatsApp Integration",
      desc: "Receive updates directly on WhatsApp for easy access",
    },
    {
      icon: "🆘",
      title: "Emergency SOS",
      desc: "One-click emergency alert to notify all family members immediately",
    },
    {
      icon: "📱",
      title: "Multi-Family Support",
      desc: "Add multiple family members and caregivers to monitor and support",
    },
    {
      icon: "🔐",
      title: "Privacy Control",
      desc: "Full control over what information is shared with whom",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Add Family Member",
      desc: "Go to your profile and add your family member's WhatsApp number",
    },
    {
      step: "2",
      title: "Configure Alerts",
      desc: "Choose which health metrics trigger notifications (heart rate, blood pressure, etc.)",
    },
    {
      step: "3",
      title: "Get Notified",
      desc: "When health data is concerning, WhatsApp alerts are sent automatically",
    },
    {
      step: "4",
      title: "Stay Connected",
      desc: "Family members can instantly see your status and respond to emergencies",
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
              Family <br className="hidden sm:block" />
              Health Sync
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Keep your family connected and informed with real-time health alerts
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-emerald-100/80 bg-white p-8 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-4xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple setup, powerful family connection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, idx) => (
                <div key={item.step} className="relative">
                  {/* Connector Line */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent" />
                  )}

                  <div className="relative bg-white rounded-2xl border border-emerald-100 p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alert Types */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-white rounded-3xl mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Supported Alerts
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                Never miss important health updates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "❤️", name: "High Heart Rate", desc: "When HR exceeds safe limits" },
                { icon: "⏱️", name: "Missed Medication", desc: "When dose is not taken on time" },
                { icon: "😴", name: "Low Sleep", desc: "When sleep duration is insufficient" },
                { icon: "🚶", name: "Low Activity", desc: "When daily steps fall below target" },
                { icon: "🌡️", name: "Abnormal Vitals", desc: "Blood pressure or temperature alerts" },
                { icon: "🆘", name: "Emergency SOS", desc: "One-click emergency notification" },
              ].map((alert) => (
                <div
                  key={alert.name}
                  className="flex gap-4 p-6 rounded-2xl border border-emerald-100 bg-white hover:border-emerald-300 transition-colors"
                >
                  <div className="text-3xl flex-shrink-0">{alert.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{alert.name}</h4>
                    <p className="text-sm text-gray-600">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl border border-emerald-200 p-12 sm:p-16 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Connect with Your Family
            </h2>
            <p className="text-lg text-gray-600">
              Set up family alerts in just a few minutes and stay connected
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-600 transition-all duration-200"
              >
                Get Started
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
