// components/Checklist.jsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { setCookie, getCookie } from "cookies-next";
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
    dueTime: "09:00",
  },
  {
    id: "default_2",
    key: "drank_water",
    label: "checklist.drankWater",
    emoji: "💧",
    checked: false,
    subtitle: "checklist.waterSubtitle",
    isDefault: true,
    dueTime: "14:00",
  },
  {
    id: "default_3",
    key: "walked",
    label: "checklist.walked",
    emoji: "🚶",
    checked: false,
    subtitle: "checklist.walkedSubtitle",
    isDefault: true,
    dueTime: "18:00",
  },
];

const EMOJI_OPTIONS = [
  "💊", "💧", "🚶", "🍎", "🧘", "😴",
  "📖", "🫁", "🩺", "🥗", "🧹", "📞", "🎵", "🙏",
];

/* ── Helper: today as YYYY-MM-DD in local timezone ── */
function getLocalDateString() {
  return new Date().toLocaleDateString("en-CA");
}

/* ── Helper: is a given HH:MM past right now? ── */
function isPastDueTime(dueTime) {
  if (!dueTime) return false;
  const [h, m] = dueTime.split(":").map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

/* ── Helper: format HH:MM to readable string ── */
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* ── Helper: convert HH:MM to "9:00 AM" format for WhatsApp ── */
function dueTimeToDisplayTime(dueTime) {
  if (!dueTime) return "";
  return formatTime(dueTime);
}

export default function Checklist({
  demoActive = false,
  userId = null,
  onMissedTasksChange = null,
}) {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);

  // Add-new-item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("💊");
  const [newDueTime, setNewDueTime] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit/Delete state
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Track which overdue notifications we already fired today
  const notifiedRef = useRef(new Set());
  const [alertedTasks, setAlertedTasks] = useState({});

  const inputRef = useRef(null);

  /* ─────────────────────────────────────────────
     LOAD ALERTED TASKS FROM COOKIE ON MOUNT
     ───────────────────────────────────────────── */
  useEffect(() => {
    try {
      const saved = getCookie("wa_alerted_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getLocalDateString();
        const todayAlerts = {};
        Object.entries(parsed).forEach(([key, val]) => {
          if (key.startsWith(today)) {
            todayAlerts[key] = val;
          }
        });
        setAlertedTasks(todayAlerts);
      }
    } catch {
      setAlertedTasks({});
    }
  }, []);

  /* ─────────────────────────────────────────────
     SEND MISSED TASKS TO PARENT
     ───────────────────────────────────────────── */
  useEffect(() => {
    if (!onMissedTasksChange) return;

    const missed = items
      .filter((item) => !item.checked)
      .map((item) => ({
        id: item.id,
        key: item.key,
        title: item.isDefault ? t(item.label) : item.label,
        time: dueTimeToDisplayTime(item.dueTime),
        dueTime: item.dueTime,
        emoji: item.emoji,
        completed: item.checked,
      }));

    onMissedTasksChange(missed);
  }, [items, onMissedTasksChange, t]);

  /* ─────────────────────────────────────────────
     DAILY RESET LOGIC
     ───────────────────────────────────────────── */
  const resetIfNewDay = useCallback(
    (currentItems) => {
      const today = getLocalDateString();
      const lastReset = localStorage.getItem("tulsi_checklist_lastReset");

      if (lastReset === today) return currentItems;

      console.log("[Checklist] New day detected — resetting items");

      const resetItems = currentItems.map((item) => ({
        ...item,
        checked: false,
      }));

      localStorage.setItem("tulsi_checklist_lastReset", today);
      localStorage.setItem("tulsi_checklist", JSON.stringify({}));

      notifiedRef.current = new Set();
      localStorage.removeItem(`tulsi_notified_${lastReset}`);

      setAlertedTasks({});
      setCookie("wa_alerted_tasks", JSON.stringify({}), {
        maxAge: 60 * 60 * 24,
      });

      if (userId) {
        supabase
          .from("checklist_items")
          .update({ checked: false, notification_sent: false })
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error) console.warn("[Checklist] Reset sync failed", error.message);
          });
      }

      return resetItems;
    },
    [userId]
  );

  /* ─────────────────────────────────────────────
     LOAD CHECKLIST ON MOUNT
     ───────────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;

    const loadChecklist = async () => {
      try {
        // 1. Get explicitly deleted default items so they don't respawn
        const localDeleted = JSON.parse(localStorage.getItem("tulsi_deleted_defaults") || "[]");
        let baseItems = [...DEFAULT_ITEMS].filter(i => !localDeleted.includes(i.key));

        const localRaw = localStorage.getItem("tulsi_checklist");
        const localCustom = localStorage.getItem("tulsi_checklist_custom");
        const localDueTimes = localStorage.getItem("tulsi_checklist_dueTimes");

        // 2. Apply saved checked states
        if (localRaw && mounted) {
          const parsed = JSON.parse(localRaw);
          baseItems = baseItems.map((item) => ({
            ...item,
            checked: Boolean(parsed[item.key]),
          }));
        }

        // 3. Apply custom due times
        if (localDueTimes && mounted) {
          const dueTimes = JSON.parse(localDueTimes);
          baseItems = baseItems.map((item) => ({
            ...item,
            dueTime: dueTimes[item.key] ?? item.dueTime,
          }));
        }

        // 4. Merge custom tasks & edited defaults
        if (localCustom && mounted) {
          const customItems = JSON.parse(localCustom);
          
          // Apply edits to default items
          baseItems = baseItems.map(defItem => {
             const customized = customItems.find(c => c.key === defItem.key);
             return customized ? customized : defItem;
          });

          // Append purely custom new items
          const defaultKeys = DEFAULT_ITEMS.map((i) => i.key);
          baseItems = [
            ...baseItems,
            ...customItems.filter((i) => !defaultKeys.includes(i.key)),
          ];
        }

        baseItems = resetIfNewDay(baseItems);

        // If offline / no user, set state and stop
        if (!userId) {
          if (mounted) {
            setItems(baseItems);
            setOfflineMode(true);
          }
          return;
        }

        // 5. Sync from DB
        const { data, error } = await supabase
          .from("checklist_items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (mounted && data?.length) {
          const mergedItems = [];
          
          // Override loaded items with DB data
          baseItems.forEach(item => {
             const dbRow = data.find(row => row.item_key === item.key);
             if (dbRow) {
                 mergedItems.push({
                     ...item,
                     checked: dbRow.checked,
                     dueTime: dbRow.due_time || item.dueTime,
                     dbId: dbRow.id,
                     // If it has a label in DB, it means it was customized
                     ...(dbRow.label ? {
                         isDefault: false,
                         label: dbRow.label,
                         emoji: dbRow.emoji || item.emoji,
                         subtitle: dbRow.subtitle || ""
                     } : {})
                 });
             } else {
                 mergedItems.push(item);
             }
          });

          // Append purely new DB items
          const loadedKeys = mergedItems.map(i => i.key);
          const pureCustomFromDb = data
              .filter(row => !loadedKeys.includes(row.item_key) && !localDeleted.includes(row.item_key))
              .map(row => ({
                  id: row.id || `db_${row.item_key}`,
                  dbId: row.id,
                  key: row.item_key,
                  label: row.label || row.item_key,
                  emoji: row.emoji || "✅",
                  checked: row.checked,
                  subtitle: row.subtitle || "",
                  dueTime: row.due_time || "",
                  isDefault: false,
              }));

          let allItems = [...mergedItems, ...pureCustomFromDb];
          allItems = resetIfNewDay(allItems);

          setItems(allItems);
          setOfflineMode(false);
        } else if (mounted) {
          setItems(baseItems);
        }

        const today = getLocalDateString();
        const savedNotified = localStorage.getItem(`tulsi_notified_${today}`);
        if (savedNotified) {
          notifiedRef.current = new Set(JSON.parse(savedNotified));
        }
      } catch (error) {
        console.warn("[Checklist] Offline mode", error?.message || error);
        if (mounted) setOfflineMode(true);
      }
    };

    loadChecklist();
    return () => {
      mounted = false;
    };
  }, [userId, resetIfNewDay]);

  /* ─────────────────────────────────────────────
     MIDNIGHT WATCHER & WHATSAPP ALERTS
     ───────────────────────────────────────────── */
  useEffect(() => {
    const checkAndAlert = () => {
      const today = getLocalDateString();
      const lastReset = localStorage.getItem("tulsi_checklist_lastReset");

      if (lastReset !== today) {
        setItems((prev) => resetIfNewDay(prev));
      }

      const savedPhone = getCookie("wa_phone");
      if (!savedPhone) return;

      const patientName = getCookie("wa_name") || "Elder";
      const now = new Date();

      const newOverdueTasks = items.filter((item) => {
        if (item.checked || !item.dueTime || !isPastDueTime(item.dueTime)) return false;
        const alertKey = `${today}_${item.key}`;
        if (alertedTasks[alertKey]) return false;
        return true;
      });

      if (newOverdueTasks.length === 0) return;

      const taskList = newOverdueTasks
        .map((item, i) => {
          const name = item.isDefault ? t(item.label) : item.label;
          return `   ${i + 1}. ❌ ${item.emoji} ${name} (Deadline: ${formatTime(item.dueTime)})`;
        })
        .join("\n");

      const message =
        `🚨 *TulsiRaksha-AI — Deadline Alert*\n\n` +
        `👤 *Patient:* ${patientName}\n` +
        `📅 *Date:* ${now.toLocaleDateString()}\n` +
        `⏰ *Alert Time:* ${now.toLocaleTimeString()}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ *${newOverdueTasks.length} TASK${newOverdueTasks.length > 1 ? "S" : ""} CROSSED DEADLINE:*\n\n` +
        `${taskList}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `🔴 ${patientName} has not completed ${newOverdueTasks.length > 1 ? "these tasks" : "this task"}.\n` +
        `Please check on them and remind them.\n\n` +
        `— TulsiRaksha-AI 🤖`;

      window.open(
        `https://wa.me/${savedPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      const updatedAlerts = { ...alertedTasks };
      newOverdueTasks.forEach((item) => {
        const alertKey = `${today}_${item.key}`;
        updatedAlerts[alertKey] = {
          sentAt: now.toISOString(),
          task: item.isDefault ? t(item.label) : item.label,
          deadline: formatTime(item.dueTime),
        };
      });

      setAlertedTasks(updatedAlerts);
      setCookie("wa_alerted_tasks", JSON.stringify(updatedAlerts), {
        maxAge: 60 * 60 * 24,
      });
    };

    checkAndAlert();
    const interval = setInterval(checkAndAlert, 60_000);
    return () => clearInterval(interval);
  }, [items, alertedTasks, t, resetIfNewDay]);

  /* ─────────────────────────────────────────────
     PERSIST
     ───────────────────────────────────────────── */
  const persistChecklist = async (nextItems) => {
    const localState = nextItems.reduce((acc, item) => {
      acc[item.key] = item.checked;
      return acc;
    }, {});
    localStorage.setItem("tulsi_checklist", JSON.stringify(localState));

    const dueTimes = nextItems.reduce((acc, item) => {
      if (item.dueTime) acc[item.key] = item.dueTime;
      return acc;
    }, {});
    localStorage.setItem("tulsi_checklist_dueTimes", JSON.stringify(dueTimes));

    // Save custom items AND customized defaults (!isDefault)
    const customItems = nextItems.filter((i) => !i.isDefault);
    localStorage.setItem("tulsi_checklist_custom", JSON.stringify(customItems));

    const cookieData = nextItems.map((item) => ({
      id: item.id,
      key: item.key,
      title: item.isDefault ? t(item.label) : item.label,
      time: dueTimeToDisplayTime(item.dueTime),
      dueTime: item.dueTime,
      emoji: item.emoji,
      completed: item.checked,
    }));
    setCookie("checklist_tasks", JSON.stringify(cookieData), {
      maxAge: 60 * 60 * 24,
    });

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
        due_time: item.dueTime || null,
      }));

      await supabase.from("checklist_items").upsert(payload, { onConflict: "user_id,item_key" });
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
      dueTime: newDueTime || "",
      isDefault: false,
    };

    const nextItems = [...items, newItem];
    setItems(nextItems);

    setNewLabel("");
    setNewSubtitle("");
    setNewEmoji("💊");
    setNewDueTime("");
    setShowAddForm(false);

    await persistChecklist(nextItems);
    setAdding(false);
  };

  /* ── Initiate Edit ── */
  const startEdit = (item) => {
    setEditingItem({
      ...item,
      label: item.isDefault ? t(item.label) : item.label,
      subtitle: item.isDefault ? t(item.subtitle) : item.subtitle,
    });
  };

  /* ── Save Edit ── */
  const handleSaveEdit = async () => {
    if (!editingItem.label.trim()) return;

    const updatedItem = {
      ...editingItem,
      isDefault: false, // Make it custom so their text edits stick and don't get overridden by translations
    };

    const nextItems = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    setItems(nextItems);
    setEditingItem(null);
    await persistChecklist(nextItems);
  };

  /* ── Delete Item ── */
  const handleDeleteItem = async (itemKey) => {
    const itemToDelete = items.find(i => i.key === itemKey);
    const nextItems = items.filter((i) => i.key !== itemKey);
    setItems(nextItems);
    setDeleteConfirm(null);

    // If it's a default item (or was originally one), save its key so it doesn't come back
    if (DEFAULT_ITEMS.some(d => d.key === itemKey)) {
      const deleted = JSON.parse(localStorage.getItem("tulsi_deleted_defaults") || "[]");
      if (!deleted.includes(itemKey)) {
        deleted.push(itemKey);
        localStorage.setItem("tulsi_deleted_defaults", JSON.stringify(deleted));
      }
    }

    await persistChecklist(nextItems);

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

  useEffect(() => {
    if (showAddForm && inputRef.current) inputRef.current.focus();
  }, [showAddForm]);

  const completedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const overdueCount = items.filter(
    (i) => !i.checked && i.dueTime && isPastDueTime(i.dueTime)
  ).length;
  const alertedCount = Object.keys(alertedTasks).length;

  return (
    <div
      className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-500 ${
        demoActive ? "border-emerald-300 ring-4 ring-emerald-100 scale-[1.01]" : "border-gray-200"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("checklist.title")}
        </h3>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
              🚨 {overdueCount} overdue
            </span>
          )}
          {alertedCount > 0 && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              📱 {alertedCount} alerted
            </span>
          )}
          <span className="text-base sm:text-lg font-bold text-emerald-600">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs sm:text-sm font-semibold ${offlineMode ? "text-amber-600" : "text-emerald-600"}`}>
          {offlineMode ? t("checklist.offline") : t("checklist.synced")}
        </p>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${getCookie("wa_phone") ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-400">
            {getCookie("wa_phone") ? "Auto WhatsApp alerts ON" : "Set phone in WhatsApp Alert →"}
          </span>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

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
        {items.map((item) => {
          const overdue = !item.checked && item.dueTime && isPastDueTime(item.dueTime);
          const today = getLocalDateString();
          const alertKey = `${today}_${item.key}`;
          const wasAlerted = !!alertedTasks[alertKey];

          // --- EDIT MODE UI ---
          if (editingItem?.id === item.id) {
            return (
              <div key={item.id} className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                    ✏️ Edit Task
                  </h4>
                </div>
                
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditingItem({ ...editingItem, emoji })}
                        className={`w-9 h-9 rounded-xl text-lg transition-all ${
                          editingItem.emoji === emoji ? "bg-emerald-500 shadow-md scale-110" : "bg-white border border-gray-200"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    placeholder="Task Name"
                    className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="text"
                    value={editingItem.subtitle}
                    onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                    placeholder="Description (Optional)"
                    className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Due Time:</span>
                    <input
                      type="time"
                      value={editingItem.dueTime}
                      onChange={(e) => setEditingItem({ ...editingItem, dueTime: e.target.value })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveEdit} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600">Save</button>
                  <button onClick={() => setEditingItem(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            );
          }

          // --- NORMAL ROW UI ---
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 group relative ${
                item.checked
                  ? "bg-emerald-50/70 border-2 border-emerald-100"
                  : overdue
                  ? "bg-red-50/60 border-2 border-red-200"
                  : "bg-gray-50 hover:bg-gray-100/80 border-2 border-transparent hover:border-emerald-100"
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  item.checked
                    ? "bg-emerald-500 shadow-lg shadow-emerald-200/50"
                    : overdue
                    ? "bg-white border-2 border-red-300 hover:border-red-400"
                    : "bg-white border-2 border-gray-200 hover:border-emerald-300"
                }`}
              >
                {item.checked && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span className="text-2xl sm:text-3xl flex-shrink-0 cursor-pointer" onClick={() => toggleItem(item.id)}>
                {item.emoji}
              </span>

              <div className="flex-1 min-w-0" onClick={() => toggleItem(item.id)}>
                <span className={`text-base sm:text-lg font-semibold block transition-colors cursor-pointer ${
                  item.checked ? "text-emerald-700 line-through decoration-2" : overdue ? "text-red-700" : "text-gray-800"
                }`}>
                  {item.isDefault ? t(item.label) : item.label}
                </span>

                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-sm ${item.checked ? "text-emerald-500" : overdue ? "text-red-500" : "text-gray-400"}`}>
                    {item.checked ? t("checklist.completed") : overdue ? "⚠️ Crossed deadline!" : item.isDefault ? t(item.subtitle) : item.subtitle || "Tap to complete"}
                  </span>

                  {item.dueTime && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.checked ? "bg-emerald-100 text-emerald-600" : overdue ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      🕐 {formatTime(item.dueTime)}
                    </span>
                  )}

                  {wasAlerted && !item.checked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      📱 Family alerted
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons (Edit/Delete) */}
              <div className="flex-shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {deleteConfirm === item.key ? (
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs font-bold text-red-500">Delete?</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleDeleteItem(item.key)} className="px-2 py-1 rounded bg-red-500 text-white text-xs font-bold">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs font-bold">No</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEdit(item)} title="Edit Task" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      ✏️
                    </button>
                    <button onClick={() => setDeleteConfirm(item.key)} title="Delete Task" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add New Item Form ── */}
      {showAddForm ? (
        <div className="mt-5 p-5 sm:p-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 space-y-4">
          <h4 className="text-lg font-bold text-gray-900">Add New Task</h4>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Choose an icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    newEmoji === emoji ? "bg-emerald-500 shadow-md scale-110" : "bg-white border border-gray-200 hover:border-emerald-300 hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Task name *</label>
            <input
              ref={inputRef}
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Take evening medicine"
              maxLength={60}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base font-medium text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
              onKeyDown={(e) => { if (e.key === "Enter" && newLabel.trim()) handleAddItem(); }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Description (optional)</label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="e.g. After dinner"
              maxLength={80}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Due time (optional — auto WhatsApp alert if missed)</label>
            <input
              type="time"
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAddItem}
              disabled={!newLabel.trim() || adding}
              className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all ${
                !newLabel.trim() || adding ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {adding ? "Adding..." : "✅ Add Task"}
            </button>
            <button onClick={() => { setShowAddForm(false); setNewLabel(""); setNewSubtitle(""); setNewEmoji("💊"); setNewDueTime(""); }} className="px-6 py-3.5 rounded-xl text-base font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 text-base sm:text-lg font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-[0.98]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Task
        </button>
      )}
    </div>
  );
}