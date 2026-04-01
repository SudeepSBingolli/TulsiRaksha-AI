"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Dashboard from "@/app/components/Dashboard";

export default function DashboardPage() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Friend");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) setLoading(false);
        return;
      }

      if (active) setUserId(user.id);

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

      if (active) setLoading(false);
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
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

  return <Dashboard userName={userName} userId={userId} />;
}