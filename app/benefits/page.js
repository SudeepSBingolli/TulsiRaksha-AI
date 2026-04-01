"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function BenefitsPage() {
  const { t } = useI18n();

  const benefits = [
    {
      icon: "❤️",
      title: "Better Health Outcomes",
      desc: t("landing.benefit1"),
      details: "Regular monitoring and timely interventions lead to improved health metrics and faster recovery.",
    },
    {
      icon: "🕐",
      title: "Never Miss Medications",
      desc: t("landing.benefit2"),
      details: "Smart reminders ensure 100% medication adherence with voice alerts and family notifications.",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Peace of Mind for Family",
      desc: t("landing.benefit3"),
      details: "Real-time health alerts and automated reports keep family members informed and connected.",
    },
  ];

  const whyChoose = [
    {
      number: "01",
      title: "Trusted by Healthcare Professionals",
      desc: "Built with input from doctors and geriatric specialists for genuine health needs.",
    },
    {
      number: "02",
      title: "Culturally Adapted",
      desc: "Available in multiple Indian languages with voice interface for all literacy levels.",
    },
    {
      number: "03",
      title: "Privacy First",
      desc: "Your health data is encrypted and never shared without your explicit consent.",
    },
    {
      number: "04",
      title: "Always Available",
      desc: "24/7 AI companion support without waiting times or appointments.",
    },
    {
      number: "05",
      title: "Affordable Care",
      desc: "Premium health monitoring at a fraction of traditional healthcare costs.",
    },
    {
      number: "06",
      title: "Easy to Use",
      desc: "Designed specifically for seniors with large text, simple navigation, and voice commands.",
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
              Why Choose TulsiRaksha?
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover the benefits of intelligent health management designed for you
            </p>
          </div>
        </section>

        {/* Main Benefits Grid */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-emerald-100/80 bg-white p-8 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-3xl">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                    {benefit.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                What Makes Us Different
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tailored solutions designed specifically for senior health management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyChoose.map((item) => (
                <div
                  key={item.number}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-8 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-lg">
                        {item.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-white rounded-3xl mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                  From Our Families
                </h2>
                <p className="text-lg text-gray-600 mt-4">
                  Real stories from people who trust TulsiRaksha
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xl">⭐</span>
                      ))}
                    </div>
                    <p className="text-gray-600 italic mb-6 leading-relaxed">
                      "TulsiRaksha has given me peace of mind. I can track my health easily, and my kids know I'm okay."
                    </p>
                    <div>
                      <p className="font-bold text-gray-900">Rajesh Kumar</p>
                      <p className="text-sm text-gray-500">Senior User</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl border border-emerald-200 p-12 sm:p-16 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Experience the Difference
            </h2>
            <p className="text-lg text-gray-600">
              Start your journey to better health management today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-emerald-600 transition-all duration-200"
              >
                Start Free Trial
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
