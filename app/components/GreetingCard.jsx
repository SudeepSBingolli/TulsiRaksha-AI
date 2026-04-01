"use client";

import { useState, useEffect } from "react";

export default function GreetingCard() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-7 sm:p-8 text-white overflow-hidden shadow-xl shadow-emerald-200/40">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <svg
          className="absolute bottom-4 right-4 w-24 h-24 opacity-10"
          viewBox="0 0 64 64"
          fill="white"
        >
          <path d="M32 4 C32 4, 56 20, 56 40 C56 54, 44 60, 32 60 C20 60, 8 54, 8 40 C8 20, 32 4, 32 4Z" />
        </svg>
      </div>

      <div className="relative z-10">
        <p className="text-emerald-100 text-sm sm:text-base font-medium mb-1">
          {currentDate}
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            {getGreeting()},
          </h2>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-1">
          Appa 👋
        </h3>
        <p className="text-emerald-100 text-base sm:text-lg font-light mt-3">
          ನಮಸ್ಕಾರ ಅಪ್ಪ — You&apos;re doing great today!
        </p>

        <div className="flex items-center gap-4 mt-6 pt-5 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-semibold">
              {currentTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-sm">🌡️</span>
            </div>
            <span className="text-sm sm:text-base font-semibold">28°C Bengaluru</span>
          </div>
        </div>
      </div>
    </div>
  );
}