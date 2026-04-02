"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useI18n } from "@/app/i18n";

const DEFAULT_ITEMS = [
  {
    id: "default_1",
    key: "medicine_taken",
    label: "checklist.medicineTaken",
    emoji: "💊",
    checked: false,
    subtitle: "checklist.medicineSubtitle",
    isDefault: true,
  },
  {
    id: "default_2",
    key: "drank_water",
    label: "checklist.drankWater",
    emoji: "💧",
    checked: false,
    subtitle: "checklist.waterSubtitle",
    isDefault: true,
  },
  {
    id: "default_3",
    key: "walked",
    label: "checklist.walked",
    emoji: "🚶",
    checked: false,
    subtitle: "checklist.walkedSubtitle",
    isDefault: true,
  },
];

const EMOJI_OPTIONS = ["💊", "💧", "🚶", "🍎", "🧘", "😴", "📖", "🫁", "🩺", "🥗", "🧹", "📞", "🎵", "🙏"];

export default function Checklist({ demoActive = false, userId = null }) {
  const { t } = useI18n();
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [offlineMode, setOfflineMode] = useState(false);

  // Add-new-item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("💊");
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const inputRef = useRef(null);

  /* ── Load checklist on mount ── */
  useEffect(() => {
    let mounted = true;

    const loadChecklist = async () => {
      try {
        // Load local state first
        const localRaw = localStorage.getItem("tulsi_checklist");
        const localCustom = localStorage.getItem("tulsi_checklist_custom");

        if (localRaw && mounted) {
          const parsed = JSON.parse(localRaw);
          setItems((prev) =>
            prev.map((item) => ({
              ...item,
              checked: Boolean(parsed[item.key]),
            }))
          );
        }

        // Load custom items from local storage
        if (localCustom && mounted) {
          const customItems = JSON.parse(localCustom);
          setItems((prev) => {
            const defaultKeys = prev.filter((i) => i.isDefault).map((i) => i.key);
            const merged = [
              ...prev.filter((i) => i.isDefault),
              ...customItems.filter((i) => !defaultKeys.includes(i.key)),
            ];
            return merged;
          });
        }

        if (!userId) {
          setOfflineMode(true);
          return;
        }

        // Load from Supabase
        const { data, error } = await supabase
          .from("checklist_items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (mounted && data?.length) {
          setItems((prev) => {
            // Start with defaults, update checked state from DB
            const updatedDefaults = prev
              .filter((i) => i.isDefault)
              .map((item) => {
                const fromDb = data.find((row) => row.item_key === item.key);
                return fromDb
                  ? { ...item, checked: fromDb.checked, dbId: fromDb.id }
                  : item;
              });

            // Add custom items from DB
            const defaultKeys = updatedDefaults.map((i) => i.key);
            const customFromDb = data
              .filter((row) => !defaultKeys.includes(row.item_key))
              .map((row) => ({
                id: row.id || `db_${row.item_key}`,
                dbId: row.id,
                key: row.item_key,
                label: row.label || row.item_key,
                emoji: row.emoji || "✅",
                checked: row.checked,
                subtitle: row.subtitle || "",
                isDefault: false,
              }));

            return [...updatedDefaults, ...customFromDb];
          });
          setOfflineMode(false);
        }
      } catch (error) {
        console.warn("[Checklist] Offline mode", error?.message || error);
        setOfflineMode(true);
      }
    };

    loadChecklist();
    return () => {
      mounted = false;
    };
  }, [userId]);

  /* ── Persist to localStorage + Supabase ── */
  const persistChecklist = async (nextItems) => {
    // Save checked state locally
    const localState = nextItems.reduce((acc, item) => {
      acc[item.key] = item.checked;
      return acc;
    }, {});
    localStorage.setItem("tulsi_checklist", JSON.stringify(localState));

    // Save custom items locally
    const customItems = nextItems.filter((i) => !i.isDefault);
    localStorage.setItem("tulsi_checklist_custom", JSON.stringify(customItems));

    if (!userId) {
      setOfflineMode(true);
      return;
    }

    try {
      const payload = nextItems.map((item) => ({
        user_id: userId,
        item_key: item.key,
        checked: item.checked,
        label: item.isDefault ? null : item.label,
        emoji: item.isDefault ? null : item.emoji,
        subtitle: item.isDefault ? null : item.subtitle,
      }));

      const { error } = await supabase
        .from("checklist_items")
        .upsert(payload, { onConflict: "user_id,item_key" });

      if (error) throw error;
      setOfflineMode(false);
    } catch (error) {
      console.warn("[Checklist] Sync failed", error?.message || error);
      setOfflineMode(true);
    }
  };

  /* ── Toggle item ── */
  const toggleItem = async (id) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(nextItems);
    await persistChecklist(nextItems);
  };

  /* ── Add new item ── */
  const handleAddItem = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);

    const itemKey = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newItem = {
      id: itemKey,
      key: itemKey,
      label: newLabel.trim(),
      emoji: newEmoji,
      checked: false,
      subtitle: newSubtitle.trim() || "",
      isDefault: false,
    };

    const nextItems = [...items, newItem];
    setItems(nextItems);

    // Reset form
    setNewLabel("");
    setNewSubtitle("");
    setNewEmoji("💊");
    setShowAddForm(false);

    await persistChecklist(nextItems);
    setAdding(false);
  };

  /* ── Delete custom item ── */
  const handleDeleteItem = async (itemKey) => {
    const nextItems = items.filter((i) => i.key !== itemKey);
    setItems(nextItems);
    setDeleteConfirm(null);

    // Remove from local storage
    const customItems = nextItems.filter((i) => !i.isDefault);
    localStorage.setItem("tulsi_checklist_custom", JSON.stringify(customItems));

    // Remove from Supabase
    if (userId) {
      try {
        await supabase
          .from("checklist_items")
          .delete()
          .eq("user_id", userId)
          .eq("item_key", itemKey);
      } catch (error) {
        console.warn("[Checklist] Delete sync failed", error?.message);
      }
    }
  };

  /* ── Focus input when form opens ── */
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const completedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div
      className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-500 ${
        demoActive
          ? "border-emerald-300 ring-4 ring-emerald-100 scale-[1.01]"
          : "border-gray-200"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("checklist.title")}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-base sm:text-lg font-bold text-emerald-600">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      {/* Sync status */}
      <p
        className={`text-xs sm:text-sm mb-3 font-semibold ${
          offlineMode ? "text-amber-600" : "text-emerald-600"
        }`}
      >
        {offlineMode ? t("checklist.offline") : t("checklist.synced")}
      </p>

      {/* ── Progress Bar ── */}
      <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── All Done Message ── */}
      {items.length > 0 && completedCount === items.length && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-lg font-bold text-emerald-700 mt-1">
            All tasks completed! Great job!
          </p>
        </div>
      )}

      {/* ── Checklist Items ── */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 group ${
              item.checked
                ? "bg-emerald-50/70 border-2 border-emerald-100"
                : "bg-gray-50 hover:bg-gray-100/80 border-2 border-transparent hover:border-emerald-100"
            }`}
          >
            {/* Checkbox button */}
            <button
              onClick={() => toggleItem(item.id)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                item.checked
                  ? "bg-emerald-500 shadow-lg shadow-emerald-200/50"
                  : "bg-white border-2 border-gray-200 hover:border-emerald-300"
              }`}
              aria-label={item.checked ? "Uncheck" : "Check"}
            >
              {item.checked && (
                <svg
                  className="w-5 h-5 text-white"
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
            </button>

            {/* Emoji */}
            <span className="text-2xl sm:text-3xl flex-shrink-0">
              {item.emoji}
            </span>

            {/* Label */}
            <div className="flex-1 min-w-0" onClick={() => toggleItem(item.id)}>
              <span
                className={`text-base sm:text-lg font-semibold block transition-colors cursor-pointer ${
                  item.checked
                    ? "text-emerald-700 line-through decoration-2"
                    : "text-gray-800"
                }`}
              >
                {item.isDefault ? t(item.label) : item.label}
              </span>
              <span
                className={`text-sm block mt-0.5 ${
                  item.checked ? "text-emerald-500" : "text-gray-400"
                }`}
              >
                {item.checked
                  ? t("checklist.completed")
                  : item.isDefault
                  ? t(item.subtitle)
                  : item.subtitle || "Tap to complete"}
              </span>
            </div>

            {/* Delete button (only for custom items) */}
            {!item.isDefault && (
              <div className="flex-shrink-0">
                {deleteConfirm === item.key ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteItem(item.key)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item.key)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    aria-label="Delete item"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Add New Item Form ── */}
      {showAddForm ? (
        <div className="mt-5 p-5 sm:p-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 space-y-4">
          <h4 className="text-lg font-bold text-gray-900">Add New Task</h4>

          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Choose an icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    newEmoji === emoji
                      ? "bg-emerald-500 shadow-md scale-110"
                      : "bg-white border border-gray-200 hover:border-emerald-300 hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Task name */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Task name *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Take evening medicine"
              maxLength={60}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newLabel.trim()) handleAddItem();
              }}
            />
          </div>

          {/* Optional subtitle */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="e.g. After dinner"
              maxLength={80}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newLabel.trim()) handleAddItem();
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAddItem}
              disabled={!newLabel.trim() || adding}
              className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all ${
                !newLabel.trim() || adding
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✅ Add Task
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewLabel("");
                setNewSubtitle("");
                setNewEmoji("💊");
              }}
              className="px-6 py-3.5 rounded-xl text-base font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ── Add button ── */
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 text-base sm:text-lg font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-[0.98]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Task
        </button>
      )}
    </div>
  );
}