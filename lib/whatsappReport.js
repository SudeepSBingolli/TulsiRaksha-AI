export function buildMockChecklist() {
  return {
    completedTasks: ["Medicine Taken", "Drank Water"],
    pendingTasks: ["Walk", "Exercise"],
  };
}

export function buildMockLocation() {
  return {
    latitude: 12.9716,
    longitude: 77.5946,
  };
}

export function normalizeRiskLevel(riskLevel = "NORMAL") {
  const allowed = new Set(["LOW", "NORMAL", "HIGH"]);
  const normalized = String(riskLevel).toUpperCase();
  return allowed.has(normalized) ? normalized : "NORMAL";
}

export function buildWhatsAppReportData(input = {}) {
  const mockChecklist = buildMockChecklist();
  const mockLocation = buildMockLocation();

  return {
    userName: input.userName || "Appa",
    heartRate: Number(input.heartRate ?? 92),
    riskLevel: normalizeRiskLevel(input.riskLevel),
    checklist: {
      completedTasks:
        input.checklist?.completedTasks?.length > 0
          ? input.checklist.completedTasks
          : mockChecklist.completedTasks,
      pendingTasks:
        input.checklist?.pendingTasks?.length > 0
          ? input.checklist.pendingTasks
          : mockChecklist.pendingTasks,
    },
    location: {
      latitude: Number(input.location?.latitude ?? mockLocation.latitude),
      longitude: Number(input.location?.longitude ?? mockLocation.longitude),
    },
  };
}

export function formatWhatsAppReport(reportData) {
  const { userName, heartRate, riskLevel, checklist, location } = reportData;

  const completedTaskLines = checklist.completedTasks
    .map((task) => `- ${task}`)
    .join("\n");

  const pendingTaskLines = checklist.pendingTasks
    .map((task) => `- ${task}`)
    .join("\n");

  const mapsLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  return [
    "👴 TulsiRaksha AI Update",
    "",
    `User: ${userName}`,
    "",
    `❤️ Heart Rate: ${heartRate} BPM`,
    `⚠️ Risk Level: ${riskLevel}`,
    "",
    "✅ Completed Tasks:",
    completedTaskLines,
    "",
    "❌ Pending Tasks:",
    pendingTaskLines,
    "",
    "📍 Live Location:",
    mapsLink,
    "",
    "🛡️ Status: Monitoring Active",
  ].join("\n");
}
