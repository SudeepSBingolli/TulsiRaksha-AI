"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Dashboard from "@/app/components/Dashboard";
import Footer from "@/app/components/Footer";
import LandingView from "@/app/components/LandingView";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Friend");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in → show landing page
        if (active) {
          setIsLoggedIn(false);
          setChecking(false);
        }
        return;
      }

      if (active) {
        setUserId(user.id);
        setIsLoggedIn(true);
      }

      // Fetch display name
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (active && profile?.full_name) {
          setUserName(profile.full_name.split(" ")[0]);
        } else if (active) {
          setUserName(user.email?.split("@")[0] || "Friend");
        }
      } catch {
        // Silently ignore
      }

      if (active) setChecking(false);
    }

    init();

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsLoggedIn(true);
        setUserName(session.user.email?.split("@")[0] || "Friend");
      } else {
        setUserId(null);
        setIsLoggedIn(false);
        setUserName("Friend");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

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

        {/* Main content */}
        <main className="flex-1">
          {isLoggedIn ? (
            <div className="pt-6 pb-4">
              <Dashboard userName={userName} userId={userId} />
            </div>
          ) : (
            <LandingView />
          )}
        </main>

        {/* Footer — only for logged-in users */}
        {isLoggedIn && <Footer />}
      </div>
    </div>
  );
}