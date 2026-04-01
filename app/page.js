"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Dashboard from "./components/Dashboard";
import MicButton from "./components/MicButton";
import Footer from "./components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useI18n } from "./i18n";

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  const { t } = useI18n();
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session ?? null);
        setIsCheckingSession(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userName =
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0] ||
    "Appa";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      setSession(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] relative overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-50/80 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-50/60 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar
          session={session}
          userName={userName}
          userEmail={session?.user?.email || ""}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <HeroSection />

        {isCheckingSession ? (
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm text-center">
              <p className="text-xl font-semibold text-emerald-700">
                {t("page.connecting")}
              </p>
            </div>
          </section>
        ) : (
          <>
            {!session && (
              <section className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-amber-800">
                      {t("page.syncTitle")}
                    </p>
                    <p className="text-sm sm:text-base text-amber-700 mt-1">
                      {t("page.offlineText")}
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base"
                  >
                    {t("page.goLogin")}
                  </Link>
                </div>
              </section>
            )}

            <Dashboard userName={userName} userId={session?.user?.id ?? null} />
          </>
        )}

        <MicButton />
        <Footer />
      </div>
    </main>
  );
}