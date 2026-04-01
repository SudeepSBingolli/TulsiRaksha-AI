"use client";

import { useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n";
import MicButton from "./MicButton";

export default function LandingView() {
  const { t } = useI18n();
  const micRef = useRef(null);

  const exploreOptions = [
    {
      icon: "🎙️",
      title: "Features",
      desc: "Explore all powerful features",
      href: "/features",
    },
    {
      icon: "❤️",
      title: "Benefits",
      desc: "Why choose TulsiRaksha",
      href: "/benefits",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Sync",
      desc: "Connect with your family",
      href: "/family-sync",
    },
  ];

  return (
    <section className="relative px-10 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 overflow-hidden">
      {/* ── Soft background blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-100/65 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-emerald-50/75 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-emerald-50/45 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10 sm:space-y-14">
        {/* Empty space for demo video */}
        <div className="h-64 sm:h-96 lg:h-[500px]" />

        {/* ═══════════════════════════════════════
            EXPLORE MORE SECTIONS
        ═══════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Explore More
            </h2>
            <p className="text-gray-600 text-lg">
              Learn more about TulsiRaksha and find what's right for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {exploreOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="group rounded-2xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {option.title}
                  </h3>
                  <p className="text-base text-gray-500 leading-relaxed">
                    {option.desc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                    Learn more <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating MicButton (hidden, activated via ref) ── */}
      <MicButton ref={micRef} />
    </section>
  );
}