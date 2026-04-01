"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useI18n } from "@/app/i18n";

const DEFAULT_ITEMS = [
    {
      id: 1,
      key: "medicine_taken",
      label: "checklist.medicineTaken",
      emoji: "💊",
      checked: false,
      subtitle: "checklist.medicineSubtitle",
    },
    {
      id: 2,
      key: "drank_water",
      label: "checklist.drankWater",
      emoji: "💧",
      checked: false,
      subtitle: "checklist.waterSubtitle",
    },
    {
      id: 3,
      key: "walked",
      label: "checklist.walked",
      emoji: "🚶",
      checked: false,
      subtitle: "checklist.walkedSubtitle",
    },
  ];

export default function Checklist({ demoActive = false, userId = null }) {
  const { t } = useI18n();
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadChecklist = async () => {
      try {
        const localRaw = localStorage.getItem("tulsi_checklist");
        if (localRaw && mounted) {
          const parsed = JSON.parse(localRaw);
          setItems((prev) =>
            prev.map((item) => ({
              ...item,
              checked: Boolean(parsed[item.key]),
            }))
          );
        }

        if (!userId) {
          setOfflineMode(true);
          return;
        }

        const { data, error } = await supabase
          .from("checklist_items")
          .select("item_key, checked")
          .eq("user_id", userId);

        if (error) throw error;

        if (mounted && data?.length) {
          setItems((prev) =>
            prev.map((item) => {
              const fromDb = data.find((row) => row.item_key === item.key);
              return fromDb ? { ...item, checked: fromDb.checked } : item;
            })
          );
          setOfflineMode(false);
        }
      } catch (error) {
        console.warn("[Checklist] Offline mode enabled", error?.message || error);
        setOfflineMode(true);
      }
    };

    loadChecklist();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const persistChecklist = async (nextItems) => {
    const localState = nextItems.reduce((acc, item) => {
      acc[item.key] = item.checked;
      return acc;
    }, {});
    localStorage.setItem("tulsi_checklist", JSON.stringify(localState));

    if (!userId) {
      setOfflineMode(true);
      return;
    }

    try {
      const payload = nextItems.map((item) => ({
        user_id: userId,
        item_key: item.key,
        checked: item.checked,
      }));

      const { error } = await supabase
        .from("checklist_items")
        .upsert(payload, { onConflict: "user_id,item_key" });

      if (error) throw error;
      setOfflineMode(false);
    } catch (error) {
      console.warn("[Checklist] Sync unavailable, saved locally", error?.message || error);
      setOfflineMode(true);
    }
  };

  const toggleItem = async (id) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(nextItems);
    await persistChecklist(nextItems);
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div
      className={`elder-card bg-white rounded-3xl border p-6 sm:p-7 shadow-sm transition-all duration-500 ${
        demoActive
          ? "border-emerald-300 ring-4 ring-emerald-100 scale-[1.01]"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("checklist.title")}
        </h3>
        <span className="text-base sm:text-lg font-bold text-emerald-600">
          {completedCount}/{items.length}
        </span>
      </div>

      <p className={`text-xs sm:text-sm mb-3 font-semibold ${offlineMode ? "text-amber-600" : "text-emerald-600"}`}>
        {offlineMode ? t("checklist.offline") : t("checklist.synced")}
      </p>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 text-left group ${
              item.checked
                ? "bg-emerald-50/70 border border-emerald-100"
                : "bg-gray-50 hover:bg-gray-100/80 border border-transparent"
            }`}
          >
            {/* Checkbox */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                item.checked
                  ? "bg-emerald-500 shadow-lg shadow-emerald-200/50"
                  : "bg-white border-2 border-gray-200 group-hover:border-emerald-300"
              }`}
            >
              {item.checked && (
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            {/* Emoji */}
            <span className="text-xl sm:text-2xl flex-shrink-0">
              {item.emoji}
            </span>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-base sm:text-lg font-semibold block transition-colors ${
                  item.checked
                    ? "text-emerald-700 line-through decoration-2"
                    : "text-gray-800"
                }`}
              >
                  {t(item.label)}
              </span>
              <span
                className={`text-xs sm:text-sm block mt-0.5 ${
                  item.checked ? "text-emerald-500" : "text-gray-400"
                }`}
              >
                {item.checked ? t("checklist.completed") : t(item.subtitle)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}