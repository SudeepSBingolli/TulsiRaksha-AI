"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar({
  session = null,
  userName = "Appa",
  userEmail = "",
  onLogout,
  isLoggingOut = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [activeLink, setActiveLink] = useState("Home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navLinks = ["Home", "Reminders", "Health", "Family", "Settings"];
  const languages = ["EN", "ಕನ್ನಡ", "हिन्दी"];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <span className="text-lg sm:text-xl">🌿</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Tulsi
              <span className="text-emerald-600">Raksha</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => setActiveLink(link)}
                className={`px-4 xl:px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-300 ${
                  activeLink === link
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeLang === lang
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-400 rounded-full border-2 border-white" />
            </button>

            {/* Profile / Auth */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/40 hover:shadow-emerald-200/60 transition-shadow"
                >
                  <span className="text-white font-bold text-sm sm:text-base">
                    {String(userName).charAt(0).toUpperCase()}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white shadow-xl p-3 z-50">
                    <p className="text-sm font-bold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 break-all">{userEmail}</p>

                    <div className="mt-3 space-y-2">
                      <Link
                        href="/login"
                        className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={async () => {
                          setShowProfileMenu(false);
                          if (onLogout) {
                            await onLogout();
                          }
                        }}
                        disabled={isLoggingOut}
                        className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => {
                  setActiveLink(link);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-5 py-4 rounded-2xl text-lg font-medium transition-all ${
                  activeLink === link
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {link}
              </button>
            ))}
            {/* Mobile Language Toggle */}
            <div className="flex items-center gap-2 px-5 pt-3">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    activeLang === lang
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-50 text-gray-400 border border-gray-100"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}