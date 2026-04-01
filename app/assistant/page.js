"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ElderCareAssistant from "@/app/components/ElderCareAssistant";
import { supabase } from "@/lib/supabaseClient";

export default function AssistantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Appa");

  useEffect(() => {
    let active = true;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const fallbackName = user.email?.split("@")[0] || "Appa";

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (active) {
        setUserName(data?.full_name || fallbackName);
        setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Loading AI Assistant...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white border border-emerald-100 rounded-3xl shadow-sm p-6 sm:p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
          <p className="text-gray-600 mt-2">Talk with your caring Tulsi companion anytime.</p>
        </section>

        <ElderCareAssistant userName={userName} />
      </main>
    </div>
  );
}
