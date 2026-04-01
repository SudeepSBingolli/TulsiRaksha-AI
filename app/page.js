"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import LandingView from "@/app/components/LandingView";

export default function HomePage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        await supabase.auth.getUser();
        if (active) setChecking(false);
      } catch {
        if (active) setChecking(false);
      }
    }

    init();
  }, []);

  /* ── Loading spinner ── */
  if (checking) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🌿</span>
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-2xl border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-400 animate-pulse">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F9FAF5] overflow-hidden">
      {/* ── Watermark ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/logo.jpeg"
          alt="TulsiRaksha watermark"
          width={1200}
          height={1200}
          className="w-[85vw] max-w-[1200px] h-auto opacity-[0.04] select-none"
          priority
        />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar — always visible */}
        <Navbar />

        {/* Main content — only LandingView */}
        <main className="flex-1">
          <LandingView />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}