"use client";

import { useState } from "react";

export default function ActivityChart() {
  const [activeRange, setActiveRange] = useState("Week");
  const ranges = ["Day", "Week", "Month"];

  // Weekly data points
  const data = [
    { day: "Mon", value: 65, steps: "4.2k" },
    { day: "Tue", value: 78, steps: "5.1k" },
    { day: "Wed", value: 45, steps: "2.9k" },
    { day: "Thu", value: 88, steps: "5.8k" },
    { day: "Fri", value: 72, steps: "4.7k" },
    { day: "Sat", value: 92, steps: "6.1k" },
    { day: "Sun", value: 58, steps: "3.8k" },
  ];

  const maxValue = 100;
  const chartWidth = 600;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = data.map((d, i) => ({
    x: paddingX + (i / (data.length - 1)) * usableWidth,
    y: paddingY + usableHeight - (d.value / maxValue) * usableHeight,
  }));

  // Generate smooth curve path
  const generateSmoothPath = (pts) => {
    if (pts.length < 2) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) * 0.4;
      const cpx2 = next.x - (next.x - curr.x) * 0.4;
      path += ` C ${cpx1} ${curr.y}, ${cpx2} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Weekly Activity
          </h3>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Steps & movement tracking
          </p>
        </div>
        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 self-start sm:self-auto">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeRange === range
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-2xl p-3.5 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700">4.7k</p>
          <p className="text-xs sm:text-sm text-emerald-600 mt-0.5">Avg Steps</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3.5 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-700">86%</p>
          <p className="text-xs sm:text-sm text-blue-600 mt-0.5">Goal Met</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3.5 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-amber-700">5</p>
          <p className="text-xs sm:text-sm text-amber-600 mt-0.5">Day Streak</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingY + usableHeight - (val / maxValue) * usableHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? "0" : "4 4"}
                />
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points */}
          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="white"
                stroke="#10b981"
                strokeWidth="3"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#10b981"
              />
              {/* Day labels */}
              <text
                x={point.x}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs"
                fill="#94a3b8"
                fontSize="12"
                fontWeight="500"
              >
                {data[i].day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}