"use client";

export default function HealthMetrics() {
  const metrics = [
    {
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      icon: "❤️",
      color: "rose",
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      trend: "normal",
    },
    {
      label: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      icon: "🩺",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      trend: "slightly high",
    },
    {
      label: "Blood Sugar",
      value: "142",
      unit: "mg/dL",
      icon: "🩸",
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      trend: "monitoring",
    },
    {
      label: "SpO₂ Level",
      value: "97",
      unit: "%",
      icon: "🫁",
      color: "emerald",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      trend: "excellent",
    },
  ];

  const trendColors = {
    normal: "text-emerald-600 bg-emerald-50",
    "slightly high": "text-amber-600 bg-amber-50",
    monitoring: "text-orange-600 bg-orange-50",
    excellent: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Health Vitals
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated 30 min ago</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`${metric.bgColor} rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{metric.icon}</span>
              <span
                className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg ${
                  trendColors[metric.trend]
                }`}
              >
                {metric.trend}
              </span>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold ${metric.textColor}`}
            >
              {metric.value}
              <span className="text-sm sm:text-base font-normal ml-1 opacity-60">
                {metric.unit}
              </span>
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}