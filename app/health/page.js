"use client";

import { useMemo } from "react";

/* ══════════════════════════════════════════
   MOCK SMARTWATCH DATA
   Replace later with real smartwatch API data
   ══════════════════════════════════════════ */
const healthData = {
  heartRate: 74,
  bloodPressure: "118/79",
  spo2: 97,
  sleepHours: 6.4,
  steps: 3420,
  stress: 28,
};

const trends = {
  heartRateToday: [72, 75, 73, 78, 76, 74, 77, 79, 76, 74],
  stepsWeek: [2200, 3400, 4200, 2800, 5100, 3900, 3420],
  sleepWeek: [6.2, 7.1, 6.8, 5.9, 7.3, 6.7, 6.4],
};

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function getHealthScore(data) {
  let score = 100;

  if (data.heartRate < 60 || data.heartRate > 100) score -= 12;
  if (data.spo2 < 95) score -= 15;
  if (data.sleepHours < 7) score -= 10;
  if (data.steps < 3000) score -= 10;
  if (data.stress > 40) score -= 10;

  return Math.max(score, 0);
}

function getOverallStatus(score) {
  if (score >= 85) return { label: "Excellent", color: "emerald" };
  if (score >= 70) return { label: "Good", color: "emerald" };
  if (score >= 55) return { label: "Needs Attention", color: "amber" };
  return { label: "Concerning", color: "red" };
}

function parseBP(bp) {
  const [sys, dia] = bp.split("/").map(Number);
  return { sys, dia };
}

function getVitalStatus(type, value) {
  if (type === "heartRate") {
    if (value >= 60 && value <= 100) return { label: "Normal", color: "emerald" };
    return { label: "Watch Closely", color: "amber" };
  }

  if (type === "spo2") {
    if (value >= 95) return { label: "Good", color: "emerald" };
    if (value >= 92) return { label: "Low", color: "amber" };
    return { label: "Critical", color: "red" };
  }

  if (type === "steps") {
    if (value >= 4000) return { label: "Active", color: "emerald" };
    if (value >= 2500) return { label: "Moderate", color: "amber" };
    return { label: "Low Activity", color: "red" };
  }

  if (type === "sleep") {
    if (value >= 7) return { label: "Well Rested", color: "emerald" };
    if (value >= 6) return { label: "Slightly Low", color: "amber" };
    return { label: "Poor Sleep", color: "red" };
  }

  if (type === "stress") {
    if (value <= 30) return { label: "Calm", color: "emerald" };
    if (value <= 50) return { label: "Moderate", color: "amber" };
    return { label: "High Stress", color: "red" };
  }

  if (type === "bp") {
    const { sys, dia } = parseBP(value);
    if (sys < 120 && dia < 80) return { label: "Stable", color: "emerald" };
    if (sys < 140 && dia < 90) return { label: "Slightly High", color: "amber" };
    return { label: "High", color: "red" };
  }

  return { label: "Normal", color: "emerald" };
}

function colorClasses(color) {
  if (color === "emerald") {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      strong: "text-emerald-600",
    };
  }
  if (color === "amber") {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      strong: "text-amber-600",
    };
  }
  return {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    strong: "text-red-600",
  };
}

function generateAIReport(data, score) {
  const hr = getVitalStatus("heartRate", data.heartRate);
  const bp = getVitalStatus("bp", data.bloodPressure);
  const spo2 = getVitalStatus("spo2", data.spo2);
  const sleep = getVitalStatus("sleep", data.sleepHours);
  const steps = getVitalStatus("steps", data.steps);

  const lines = [];

  lines.push(
    `Heart rate is ${hr.label.toLowerCase()} at ${data.heartRate} bpm, and oxygen level is ${data.spo2}%, which is ${spo2.label.toLowerCase()}.`
  );

  lines.push(
    `Blood pressure is ${data.bloodPressure}, which appears ${bp.label.toLowerCase()}.`
  );

  if (data.sleepHours < 7) {
    lines.push(
      `Sleep duration is ${data.sleepHours} hours, which is slightly below the recommended amount.`
    );
  } else {
    lines.push(`Sleep duration is ${data.sleepHours} hours, which looks healthy.`);
  }

  if (data.steps < 3000) {
    lines.push(
      `Physical activity is lower than ideal today with ${data.steps} steps. A short walk may help.`
    );
  } else {
    lines.push(`Activity level is decent today with ${data.steps} steps recorded.`);
  }

  lines.push(
    score >= 70
      ? `Overall general health looks stable today.`
      : `Overall health needs a bit more attention today.`
  );

  return lines;
}

function generateAlerts(data) {
  const alerts = [];

  if (data.sleepHours < 7) {
    alerts.push({
      type: "warning",
      text: `Sleep was low last night (${data.sleepHours} hrs). Try to rest a little more today.`,
    });
  }

  if (data.steps < 3000) {
    alerts.push({
      type: "warning",
      text: `Activity is low today. A short evening walk is recommended.`,
    });
  }

  if (data.spo2 < 95) {
    alerts.push({
      type: "danger",
      text: `Oxygen level is lower than ideal. Please monitor closely.`,
    });
  }

  const { sys, dia } = parseBP(data.bloodPressure);
  if (sys >= 140 || dia >= 90) {
    alerts.push({
      type: "danger",
      text: `Blood pressure seems high. Consider checking again and informing family.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "good",
      text: `No major issues detected from today's smartwatch readings.`,
    });
  }

  return alerts;
}

/* ══════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════ */
function HealthSummaryCard({ score, status }) {
  const c = colorClasses(status.color);

  return (
    <div className={`rounded-3xl border p-6 sm:p-8 ${c.bg} ${c.border}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[2px] text-gray-400">
            General Health Summary
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Overall Health:{" "}
            <span className={c.strong}>{status.label}</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mt-3 max-w-2xl leading-relaxed">
            Your smartwatch shows that most vitals are stable today. This summary is generated from
            your heart rate, blood pressure, oxygen, sleep, activity, and stress readings.
          </p>
        </div>

        <div className="flex-shrink-0">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white border border-white/60 shadow-sm flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-gray-900">{score}</span>
            <span className="text-sm font-bold text-gray-400 mt-1">Health Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ title, value, sub, icon, color }) {
  const c = colorClasses(color);

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 bg-white ${c.border} hover:shadow-lg hover:shadow-gray-100/50 transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
            {value}
          </h3>
          <span className={`inline-flex mt-3 px-3 py-1 rounded-lg text-sm font-bold ${c.badge}`}>
            {sub}
          </span>
        </div>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${c.bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniLineChart({ data, color = "#10b981", title, subtitle }) {
  const width = 600;
  const height = 180;
  const pad = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (data.length - 1);
    const y = pad + ((max - v) * (height - pad * 2)) / (max - min || 1);
    return { x, y, v };
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full h-auto">
        {/* grid */}
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i * (height - pad * 2)) / 3;
          return (
            <line
              key={i}
              x1={pad}
              y1={y}
              x2={width - pad}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          );
        })}

        {/* area */}
        <path d={areaPath} fill={color} opacity="0.08" />
        {/* line */}
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {/* points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function WeeklyBarChart({ data, title, subtitle, suffix = "" }) {
  const max = Math.max(...data);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-end gap-3 h-52">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
            <span className="text-xs font-bold text-gray-500">
              {v}{suffix}
            </span>
            <div className="w-full max-w-[44px] rounded-xl bg-gray-100 h-40 flex items-end overflow-hidden">
              <div
                className="w-full rounded-xl bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ height: `${(v / max) * 100}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-400">
              {weekLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIReportCard({ reportLines }) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200/40">
          🌿
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">AI Health Report</h3>
          <p className="text-sm text-emerald-700 font-medium mt-0.5">
            Generated from smartwatch readings
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reportLines.map((line, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard({ alerts }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Health Alerts</h3>
        <p className="text-sm text-gray-400 mt-1">Important observations from today&apos;s data</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const styles =
            alert.type === "good"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : alert.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-red-50 border-red-200 text-red-700";

          const icon =
            alert.type === "good" ? "✅" : alert.type === "warning" ? "⚠️" : "🚨";

          return (
            <div
              key={i}
              className={`rounded-2xl border px-4 py-4 flex items-start gap-3 ${styles}`}
            >
              <span className="text-xl">{icon}</span>
              <p className="text-base font-medium leading-relaxed">{alert.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportActionsCard() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Sharing</h3>
        <p className="text-sm text-gray-400 mt-1">Share health insights with family or doctor</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 px-5 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all hover:shadow-lg hover:shadow-emerald-200/40">
          Download Report
        </button>
        <button className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base border border-gray-200 transition-all">
          Share with Family
        </button>
        <button className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base border border-gray-200 transition-all">
          Share with Doctor
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */
export default function HealthPage() {
  const score = useMemo(() => getHealthScore(healthData), []);
  const status = useMemo(() => getOverallStatus(score), [score]);
  const reportLines = useMemo(() => generateAIReport(healthData, score), [score]);
  const alerts = useMemo(() => generateAlerts(healthData), []);

  const hrStatus = getVitalStatus("heartRate", healthData.heartRate);
  const bpStatus = getVitalStatus("bp", healthData.bloodPressure);
  const spo2Status = getVitalStatus("spo2", healthData.spo2);
  const stepsStatus = getVitalStatus("steps", healthData.steps);
  const sleepStatus = getVitalStatus("sleep", healthData.sleepHours);
  const stressStatus = getVitalStatus("stress", healthData.stress);

  return (
    <main className="min-h-screen bg-[#fafbfd]">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[2px] text-gray-400">
            Smartwatch Health Monitoring
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-2">
            Health
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-3 max-w-2xl leading-relaxed">
            Live health insights generated from smartwatch vitals. See your trends, overall health,
            and AI-based wellness report.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

          {/* Summary */}
          <HealthSummaryCard score={score} status={status} />

          {/* Vitals grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            <VitalCard
              title="Heart Rate"
              value={`${healthData.heartRate} bpm`}
              sub={hrStatus.label}
              icon="❤️"
              color={hrStatus.color}
            />
            <VitalCard
              title="Blood Pressure"
              value={healthData.bloodPressure}
              sub={bpStatus.label}
              icon="🩺"
              color={bpStatus.color}
            />
            <VitalCard
              title="SpO₂"
              value={`${healthData.spo2}%`}
              sub={spo2Status.label}
              icon="🫁"
              color={spo2Status.color}
            />
            <VitalCard
              title="Steps"
              value={healthData.steps.toLocaleString()}
              sub={stepsStatus.label}
              icon="👣"
              color={stepsStatus.color}
            />
            <VitalCard
              title="Sleep"
              value={`${healthData.sleepHours} hrs`}
              sub={sleepStatus.label}
              icon="😴"
              color={sleepStatus.color}
            />
            <VitalCard
              title="Stress"
              value={`${healthData.stress}/100`}
              sub={stressStatus.label}
              icon="🧘"
              color={stressStatus.color}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            <MiniLineChart
              data={trends.heartRateToday}
              title="Today's Heart Rate Trend"
              subtitle="Heart rate captured throughout the day from smartwatch"
              color="#10b981"
            />
            <WeeklyBarChart
              data={trends.stepsWeek}
              title="Weekly Activity"
              subtitle="Daily steps for the past 7 days"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            <WeeklyBarChart
              data={trends.sleepWeek}
              title="Weekly Sleep"
              subtitle="Hours of sleep in the past 7 days"
              suffix="h"
            />
            <AIReportCard reportLines={reportLines} />
          </div>

          {/* Alerts */}
          <AlertsCard alerts={alerts} />

          {/* Actions */}
          <ReportActionsCard />
        </div>
      </section>
    </main>
  );
}