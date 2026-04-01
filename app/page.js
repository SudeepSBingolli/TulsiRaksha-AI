"use client";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Dashboard from "./components/Dashboard";
import MicButton from "./components/MicButton";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafbfd] relative overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-50/80 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-50/60 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <Dashboard />
        <MicButton />
        <Footer />
      </div>
    </main>
  );
}