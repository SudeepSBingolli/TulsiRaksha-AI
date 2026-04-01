"use client";

import { useState } from "react";

export default function Checklist() {
  const [items, setItems] = useState([
    {
      id: 1,
      label: "Medicine Taken",
      emoji: "💊",
      checked: false,
      subtitle: "Metformin 500mg + BP tablet",
    },
    {
      id: 2,
      label: "Drank Water",
      emoji: "💧",
      checked: false,
      subtitle: "At least 4 glasses",
    },
    {
      id: 3,
      label: "Went for Walk",
      emoji: "🚶",
      checked: false,
      subtitle: "30 minutes morning walk",
    },
    {
      id: 4,
      label: "Had Breakfast",
      emoji: "🍽️",
      checked: true,
      subtitle: "Idli & chutney ✓",
    },
    {
      id: 5,
      label: "Called Family",
      emoji: "📞",
      checked: false,
      subtitle: "Talk to Priya today",
    },
  ]);

  const toggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          Today&apos;s Checklist
        </h3>
        <span className="text-base sm:text-lg font-bold text-emerald-600">
          {completedCount}/{items.length}
        </span>
      </div>

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
                  item.checked ? "text-emerald-700" : "text-gray-800"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`text-xs sm:text-sm block mt-0.5 ${
                  item.checked ? "text-emerald-500" : "text-gray-400"
                }`}
              >
                {item.subtitle}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}