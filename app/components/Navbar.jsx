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
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, languages, t } = useI18n();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) setUserEmail(user?.email || "");
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  // All labels use t() so they translate
  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.dashboard"), path: "/dashboard" },
    { label: t("nav.familySync"), path: "/family-sync" },
    { label: t("nav.aiAssistant"), path: "/assistant" },
  ];

  const isActiveLink = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/login");
  };

  const brandName =
    t("brand.name") !== "brand.name" ? t("brand.name") : "TulsiRaksha";

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-emerald-50/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-4 flex-shrink-0 transition-all duration-300 hover:opacity-90"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl bg-white border border-emerald-100 shadow-md flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt={brandName}
                width={56}
                height={56}
                className="rounded-xl object-cover"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              {brandName}
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-semibold transition-colors duration-300 ${
                  isActiveLink(link.path)
                    ? "text-emerald-600"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center rounded-full border border-emerald-100 bg-emerald-50/40 p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    language === lang.code
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {userEmail ? (
              /* ── Avatar dropdown ── */
              <div className="relative hidden sm:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md hover:scale-105 transition-all"
                >
                  <span className="text-white font-bold text-sm">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-3 w-72 rounded-2xl border border-emerald-100 bg-white shadow-xl p-4 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-bold text-gray-900 break-all">
                      {userEmail}
                    </p>
                    <div className="mt-4 space-y-2">
                      <Link
                        href="/assistant"
                        className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("nav.aiAssistant")}
                      </Link>
                      <Link
                        href="/profile"
                        className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("nav.profileSettings")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl border border-red-300 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                {t("nav.login")}
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center"
            >
              {mobileOpen ? (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* Mobile language switcher */}
            <div className="flex items-center justify-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/40 p-0.5 mx-4 mb-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold text-center transition-all duration-200 ${
                    language === lang.code
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-4 py-2 rounded-lg transition ${
                  isActiveLink(link.path)
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-600 hover:bg-emerald-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {userEmail ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-emerald-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.profileSettings")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-red-700 hover:bg-red-50"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}