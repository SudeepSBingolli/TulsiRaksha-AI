"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/i18n";

export default function Navbar({
  session = null,
  userName = "Appa",
  userEmail = "",
  onLogout,
  isLoggingOut = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, languages, t } = useI18n();

  const navLinks = [
    { label: "home", path: "/" },
    { label: "reminders", path: "/reminders" },
    { label: "health", path: "/health" },
    { label: "family", path: "/family" },
  ];

  const isActiveLink = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white to-emerald-50/30 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="TulasiRaksha-AI"
                width={48}
                height={48}
                className="rounded-xl object-cover shadow-md"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                Tulasi<span className="text-green-600">Raksha</span>
              </div>
              <div className="text-xs text-green-600 font-semibold">AI Care</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                className={`px-4 xl:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActiveLink(link.path)
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {t ? t(`nav.${link.label}`) : link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    language === lang.code
                      ? "bg-green-500 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            </button>

            {/* Profile / Auth */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow border border-green-300"
                >
                  <span className="text-white font-bold text-sm">
                    {String(userName).charAt(0).toUpperCase()}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 rounded-xl border border-gray-200 bg-white shadow-xl p-4 z-50">
                    <p className="text-sm font-bold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 mt-1 break-all">{userEmail}</p>

                    <div className="mt-4 space-y-2">
                      <Link
                        href="/login"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        {t ? t("nav.profileSettings") : "Settings"}
                      </Link>
                      <button
                        onClick={async () => {
                          setShowProfileMenu(false);
                          if (onLogout) {
                            await onLogout();
                          }
                        }}
                        disabled={isLoggingOut}
                        className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
                      >
                        {isLoggingOut ? "Logging out..." : t ? t("nav.logout") : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {t ? t("nav.login") : "Login"}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
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
        <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActiveLink(link.path)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t ? t(`nav.${link.label}`) : link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
