"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useI18n } from "@/app/i18n";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, languages, t } = useI18n();

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) setUserEmail(user?.email || "");
    }
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-avatar-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const navLinks = userEmail
    ? [
        { label: t("nav.home"),      path: "/" },
        { label: t("nav.reminders"), path: "/reminders" },
        { label: t("nav.health"),    path: "/health" },
        { label: t("nav.family"),    path: "/family" },
      ]
    : [];

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleLogout = async () => {
    setLoggingOut(true);
    setMenuOpen(false);
    setMobileOpen(false);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-emerald-100/70 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.jpeg"
                alt="TulsiRaksha-AI"
                width={36}
                height={36}
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
              Tulsi<span className="text-emerald-600">Raksha</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          {navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Language switcher */}
            <div className="hidden sm:flex items-center bg-gray-50 border border-gray-100 rounded-full p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                    language === lang.code
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {userEmail ? (
              /* ── Logged-in avatar menu ── */
              <div className="relative hidden sm:block" data-avatar-menu>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                  aria-label="User menu"
                >
                  <span className="text-white font-black text-sm">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 p-4 z-50 animate-[fadeUp_0.18s_ease]">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-sm">{userEmail.charAt(0).toUpperCase()}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 break-all leading-tight">{userEmail}</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Link
                        href="/"
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>🏠</span> {t("nav.home")}
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>👤</span> {t("nav.profileSettings")}
                      </Link>
                      <Link
                        href="/reminders"
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>🔔</span> {t("nav.reminders")}
                      </Link>
                      <Link
                        href="/family"
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>👨‍👩‍👧</span> {t("nav.family")}
                      </Link>
                      <div className="h-px bg-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        <span>🚪</span>
                        {loggingOut ? t("nav.loggingOut") : t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged in ── */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-all"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-200/50 hover:bg-emerald-600 transition-all"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-4.5 h-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white pb-5 pt-3 space-y-1">
            {/* Language switcher (mobile) */}
            <div className="flex items-center justify-center gap-1 mx-4 mb-3 bg-gray-50 border border-gray-100 rounded-full p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold text-center transition-all ${
                    language === lang.code
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block mx-4 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive(link.path)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {userEmail ? (
              <div className="mx-4 mt-2 pt-2 border-t border-gray-100 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  👤 {t("nav.profileSettings")}
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  🚪 {loggingOut ? t("nav.loggingOut") : t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="mx-4 mt-2 pt-2 border-t border-gray-100 space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-center text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 rounded-xl text-sm font-bold text-center text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}