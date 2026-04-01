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

      if (mounted) {
        setUserEmail(user?.email || "");
      }
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

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Features", path: "/features" },
    { label: "Benefits", path: "/benefits" },
    { label: "Family Sync", path: "/family-sync" },
    { label: "AI Assistant", path: "/assistant" },
  ];

  const isActiveLink = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-emerald-50/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-4 flex-shrink-0 transition-all duration-300 hover:opacity-90"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 p-1.5 rounded-2xl bg-white border border-emerald-100 shadow-md flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt="TulsiRaksha-AI"
                width={48}
                height={48}
                className="rounded-xl object-cover"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              TulsiRaksha
            </span>
          </Link>

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

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
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
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md hover:scale-105 transition-all"
                >
                  <span className="text-white font-bold text-sm">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-emerald-100 bg-white shadow-xl p-4 z-50">
                    <p className="text-sm font-bold text-gray-900 break-all">
                      {userEmail}
                    </p>
                    <div className="mt-4 space-y-2">
                      <Link
                        href="/assistant"
                        className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        AI Assistant
                      </Link>
                      <Link
                        href="/profile"
                        className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
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
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center"
            >
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
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-emerald-50"
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
                  Profile
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
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
