"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_OPTIONS = [
  { code: "EN", label: "EN" },
  { code: "KN", label: "ಕನ್ನಡ" },
  { code: "HI", label: "हिन्दी" },
];

const DICTIONARY = {
  EN: {
    nav: {
      home: "Home",
      reminders: "Reminders",
      health: "Health",
      family: "Family",
      settings: "Settings",
      profileSettings: "Profile Settings",
      logout: "Logout",
      loggingOut: "Logging out...",
      login: "Login",
      signup: "Sign Up",
    },
    landing: {
      badge: "AI-Powered Elder Care Companion",
      title: "TulsiRaksha AI",
      subtitle1: "Never Alone.",
      subtitle2: "Always Cared For.",
      description:
        "A warm and simple care companion for elders. Health monitoring, voice guidance, and family support in one easy experience.",
      getStarted: "Get Started",
      voiceAssistant: "Voice Assistant",
      youAreSafe: "You are safe ❤️",
      monitoringActive: "Monitoring active",
      stopVoice: "Stop Voice",
      speaking: "Tulsi is speaking…",
      voiceGuidance:
        "Welcome to TulsiRaksha AI, your personal health companion for elders. To begin, click the green Get Started button. It will take you to the login page. If you already have an account, enter your email and password and click Login. If you are new, click Sign Up at the top right corner of the page. Enter your name, email, and a password to create your account. Once you are logged in, you will see your health dashboard with medicine reminders, health vitals, and family connection features. You can always click the voice assistant button again if you need help.",
      featureVoiceTitle: "Voice Assistant",
      featureVoiceDesc:
        "Simple voice guidance in familiar language for reminders and safety.",
      featureHealthTitle: "Health Monitoring",
      featureHealthDesc:
        "Live health tracking with clear alerts and family notifications.",
      featureMedicineTitle: "Medicine Support",
      featureMedicineDesc:
        "Timely reminders with easy-to-understand check-ins.",
      benefitsTitle: "Benefits for Elders",
      benefit1: "Large and readable interface",
      benefit2: "One-tap actions for quick help",
      benefit3: "Calm and reassuring visual design",
      familyTitle: "Family Connection",
      familyDesc:
        "Share updates with family members and caregivers, so everyone stays informed and connected with peace of mind.",
      familyLink: "Explore Family Features",
    },
    page: {
      connecting: "Connecting to health sensors...",
      syncTitle: "Login to sync data across devices",
      offlineText: "Offline demo mode is active. You are safe ❤️",
      goLogin: "Go to Login",
    },
    hero: {
      badge: "AI-Powered Elder Care Companion",
      sub1: "Never Alone.",
      sub2: "Always Cared For.",
      description:
        "A warm and simple care companion for elders. Health monitoring, voice guidance, and family support in one easy experience.",
      ctaPrimary: "Get Started Free",
      ctaSecondary: "Voice Assistant",
      trustFamilies: "10,000+ Families Trust Us",
      hipaa: "HIPAA Compliant",
      madeInIndia: "Made in India",
      youAreSafe: "You are safe ❤️",
      monitoringActive: "Monitoring active",
      featureVoiceTitle: "Voice Assistant",
      featureVoiceDesc:
        "Simple voice guidance in familiar language for reminders and safety.",
      featureHealthTitle: "Health Monitoring",
      featureHealthDesc:
        "Live health tracking with clear alerts and family notifications.",
      featureMedicineTitle: "Medicine Support",
      featureMedicineDesc:
        "Timely reminders with easy-to-understand check-ins.",
      benefitsTitle: "Benefits for Elders",
      benefit1: "Large and readable interface",
      benefit2: "One-tap actions for quick help",
      benefit3: "Calm and reassuring visual design",
      familyTitle: "Family Connection",
      familyDesc:
        "Share updates with family members and caregivers, so everyone stays informed and connected with peace of mind.",
      familyLink: "Explore Family Features",
    },
    dashboard: {
      title: "Your Dashboard",
      demoReady: "Ready",
      demoGreeting: "Emotional start: Appa greeting",
      demoChecklist: "Checklist shown",
      demoHeart: "Live heart rate shown",
      demoAlert: "High-risk alert popup",
      demoSos: "SOS highlighted",
      demoDone: "Demo complete",
      demoLabel: "Demo:",
      runDemo: "Run Demo Flow",
      runningDemo: "Running Demo...",
      upcoming: "Upcoming",
      viewAll: "View All",
      reminderMorningMedicine: "Morning Medicine",
      reminderDoctorCall: "Doctor Video Call",
      reminderAfternoonMedicine: "Afternoon Medicine",
      reminderEveningWalk: "Evening Walk",
    },
    greeting: {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
      message: "You are doing great today!",
    },
    checklist: {
      title: "Today's Checklist",
      offline: "Offline mode: saved on this device",
      synced: "Synced with Supabase",
      completed: "Completed",
      medicineTaken: "Medicine Taken",
      medicineSubtitle: "Metformin 500mg + BP tablet",
      drankWater: "Drank Water",
      waterSubtitle: "At least 4 glasses",
      walked: "Walked",
      walkedSubtitle: "30 minutes morning walk",
    },
    quickActions: {
      title: "Quick Actions",
      callFamily: "Call Family",
      sos: "SOS Alert",
      orderMeds: "Order Meds",
      playBhajan: "Play Bhajan",
      emergencySent: "🚨 Emergency Alert Sent to Family!",
    },
    health: {
      title: "Health Vitals",
      lastUpdated: "Last updated",
      connecting: "Connecting to health sensors...",
      highRisk: "⚠️ High Risk Detected",
      sitRelax:
        "Please sit down and relax. Family can be notified now.",
      liveStatus: "Live Health Status",
      risk: "Risk",
      status: "Status: Monitoring Active",
      safe: "You are safe ❤️",
      offline: "Offline mode",
      synced: "Synced with Supabase",
      sendUpdate: "Send Update to Family",
      updateLogged: "Update logged in console (simulated send).",
      alertPopup: "🔴 ALERT POPUP",
      monitoringText:
        "Please sit down and relax. We are monitoring you continuously.",
      heartRate: "Heart Rate",
      dailySteps: "Daily Steps",
      sleep: "Sleep",
      medicine: "Medicine",
      taken: "taken",
      missed: "missed",
      trendNormal: "normal",
      trendMonitoring: "monitoring",
      trendExcellent: "excellent",
      trendHigh: "high",
      trendLow: "low",
      riskHigh: "HIGH",
      riskNormal: "NORMAL",
      riskLow: "LOW",
    },
    mic: {
      label: "Speak to Tulsi",
      listening: "Listening...",
      guidance:
        "Speak now. Tulsi will understand medicine, safety, and greeting commands.",
      noMic:
        "Microphone not supported. Use quick voice command buttons below.",
      heard: "Heard:",
      medicineBtn: "💊 Medicine Reminder",
      safetyBtn: "🛡️ Safety Message",
      greetingBtn: "👋 Greeting",
    },
    footer: {
      description:
        "AI-powered companion for dignified elderly care. Built with love in India 🇮🇳",
      features: "Features",
      support: "Support",
      emergency: "Emergency",
      emergencyNumberLabel: "National Emergency Number",
      emergencyButton: "🚨 SOS Call Now",
      rights: "© 2025 TulsiRaksha AI. All rights reserved.",
      madeWith: "Made with",
      forElders: "for Indian elders",
      featureVoice: "Voice Assistant",
      featureMedicine: "Medicine Reminders",
      featureTracking: "Health Tracking",
      featureFamily: "Family Connect",
      featureSos: "SOS Alerts",
      supportHelp: "Help Center",
      supportContact: "Contact Us",
      supportPrivacy: "Privacy Policy",
      supportTerms: "Terms of Service",
      supportAccess: "Accessibility",
    },
  },

  KN: {
    nav: {
      home: "ಮುಖಪುಟ",
      reminders: "ಜ್ಞಾಪನೆಗಳು",
      health: "ಆರೋಗ್ಯ",
      family: "ಕುಟುಂಬ",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      profileSettings: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      logout: "ಲಾಗ್ಔಟ್",
      loggingOut: "ಲಾಗ್ಔಟ್ ಆಗುತ್ತಿದೆ...",
      login: "ಲಾಗಿನ್",
      signup: "ಸೈನ್ ಅಪ್",
    },
    landing: {
      badge: "AI ಆಧಾರಿತ ಹಿರಿಯರ ಆರೈಕೆ ಸಂಗಾತಿ",
      title: "ತುಳಸಿರಕ್ಷ AI",
      subtitle1: "ಯಾವತ್ತೂ ಒಂಟಿಯಾಗುವುದಿಲ್ಲ.",
      subtitle2: "ಯಾವತ್ತೂ ಕಾಳಜಿಯಲ್ಲಿ.",
      description:
        "ಹಿರಿಯರಿಗೆ ಆತ್ಮೀಯ ಮತ್ತು ಸರಳ ಆರೈಕೆ ಸಂಗಾತಿ. ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ, ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ, ಮತ್ತು ಕುಟುಂಬ ಬೆಂಬಲ ಒಂದೇ ಅನುಭವದಲ್ಲಿ.",
      getStarted: "ಪ್ರಾರಂಭಿಸಿ",
      voiceAssistant: "ಧ್ವನಿ ಸಹಾಯಕ",
      youAreSafe: "ನೀವು ಸುರಕ್ಷಿತ ❤️",
      monitoringActive: "ಮಾನಿಟರಿಂಗ್ ಸಕ್ರಿಯ",
      stopVoice: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
      speaking: "ತುಳಸಿ ಮಾತನಾಡುತ್ತಿದೆ…",
      voiceGuidance:
        "ತುಳಸಿರಕ್ಷ AI ಗೆ ಸ್ವಾಗತ, ಹಿರಿಯರಿಗೆ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಸಂಗಾತಿ. ಪ್ರಾರಂಭಿಸಲು, ಹಸಿರು ಪ್ರಾರಂಭಿಸಿ ಬಟನ್ ಒತ್ತಿ. ಇದು ನಿಮ್ಮನ್ನು ಲಾಗಿನ್ ಪುಟಕ್ಕೆ ಕರೆದೊಯ್ಯುತ್ತದೆ. ನೀವು ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದರೆ, ನಿಮ್ಮ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಒತ್ತಿ. ನೀವು ಹೊಸಬರಾಗಿದ್ದರೆ, ಪುಟದ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಸೈನ್ ಅಪ್ ಒತ್ತಿ. ನಿಮ್ಮ ಹೆಸರು, ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ ಖಾತೆ ಮಾಡಿ. ಲಾಗಿನ್ ಆದ ನಂತರ, ನಿಮ್ಮ ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಕಾಣಿಸುತ್ತದೆ.",
      featureVoiceTitle: "ಧ್ವನಿ ಸಹಾಯಕ",
      featureVoiceDesc:
        "ಜ್ಞಾಪನೆ ಮತ್ತು ಸುರಕ್ಷತೆಗಾಗಿ ಪರಿಚಿತ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ.",
      featureHealthTitle: "ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ",
      featureHealthDesc:
        "ಸ್ಪಷ್ಟ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಕುಟುಂಬ ಸೂಚನೆಗಳೊಂದಿಗೆ ಲೈವ್ ಆರೋಗ್ಯ ಟ್ರಾಕಿಂಗ್.",
      featureMedicineTitle: "ಔಷಧ ಬೆಂಬಲ",
      featureMedicineDesc:
        "ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ಚೆಕ್-ಇನ್‌ಗಳೊಂದಿಗೆ ಸಕಾಲಿಕ ಜ್ಞಾಪನೆಗಳು.",
      benefitsTitle: "ಹಿರಿಯರಿಗೆ ಪ್ರಯೋಜನಗಳು",
      benefit1: "ದೊಡ್ಡ ಮತ್ತು ಓದಲು ಸುಲಭವಾದ ಇಂಟರ್ಫೇಸ್",
      benefit2: "ತ್ವರಿತ ಸಹಾಯಕ್ಕಾಗಿ ಒಂದೇ-ಟ್ಯಾಪ್ ಕ್ರಿಯೆಗಳು",
      benefit3: "ಶಾಂತ ಮತ್ತು ಭರವಸೆಯ ವಿನ್ಯಾಸ",
      familyTitle: "ಕುಟುಂಬ ಸಂಪರ್ಕ",
      familyDesc:
        "ಕುಟುಂಬ ಸದಸ್ಯರು ಮತ್ತು ಆರೈಕೆದಾರರೊಂದಿಗೆ ಅಪ್ಡೇಟ್‌ಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
      familyLink: "ಕುಟುಂಬ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    },
    page: {
      connecting: "ಆರೋಗ್ಯ ಸೆನ್ಸರ್‌ಗಳಿಗೆ ಸಂಪರ್ಕವಾಗುತ್ತಿದೆ...",
      syncTitle: "ಡೇಟಾ ಸಿಂಕ್ ಮಾಡಲು ಲಾಗಿನ್ ಮಾಡಿ",
      offlineText:
        "ಆಫ್‌ಲೈನ್ ಡೆಮೋ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು ಸುರಕ್ಷಿತ ❤️",
      goLogin: "ಲಾಗಿನ್‌ಗೆ ಹೋಗಿ",
    },
    hero: {
      badge: "AI ಆಧಾರಿತ ಹಿರಿಯರ ಆರೈಕೆ ಸಂಗಾತಿ",
      sub1: "ಯಾವತ್ತೂ ಒಂಟಿಯಾಗುವುದಿಲ್ಲ.",
      sub2: "ಯಾವತ್ತೂ ಕಾಳಜಿಯಲ್ಲಿ.",
      description:
        "ಹಿರಿಯರಿಗೆ ಆತ್ಮೀಯ ಮತ್ತು ಸರಳ ಆರೈಕೆ ಸಂಗಾತಿ. ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ, ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ, ಮತ್ತು ಕುಟುಂಬ ಬೆಂಬಲ ಒಂದೇ ಅನುಭವದಲ್ಲಿ.",
      ctaPrimary: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
      ctaSecondary: "ಧ್ವನಿ ಸಹಾಯಕ",
      trustFamilies: "10,000+ ಕುಟುಂಬಗಳು ನಮ್ಮನ್ನು ನಂಬಿವೆ",
      hipaa: "HIPAA ಅನುಗುಣ",
      madeInIndia: "ಭಾರತದಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
      youAreSafe: "ನೀವು ಸುರಕ್ಷಿತ ❤️",
      monitoringActive: "ಮಾನಿಟರಿಂಗ್ ಸಕ್ರಿಯ",
      featureVoiceTitle: "ಧ್ವನಿ ಸಹಾಯಕ",
      featureVoiceDesc:
        "ಜ್ಞಾಪನೆ ಮತ್ತು ಸುರಕ್ಷತೆಗಾಗಿ ಪರಿಚಿತ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ.",
      featureHealthTitle: "ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ",
      featureHealthDesc:
        "ಸ್ಪಷ್ಟ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಕುಟುಂಬ ಸೂಚನೆಗಳೊಂದಿಗೆ ಲೈವ್ ಆರೋಗ್ಯ ಟ್ರಾಕಿಂಗ್.",
      featureMedicineTitle: "ಔಷಧ ಬೆಂಬಲ",
      featureMedicineDesc:
        "ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ಚೆಕ್-ಇನ್‌ಗಳೊಂದಿಗೆ ಸಕಾಲಿಕ ಜ್ಞಾಪನೆಗಳು.",
      benefitsTitle: "ಹಿರಿಯರಿಗೆ ಪ್ರಯೋಜನಗಳು",
      benefit1: "ದೊಡ್ಡ ಮತ್ತು ಓದಲು ಸುಲಭವಾದ ಇಂಟರ್ಫೇಸ್",
      benefit2: "ತ್ವರಿತ ಸಹಾಯಕ್ಕಾಗಿ ಒಂದೇ-ಟ್ಯಾಪ್ ಕ್ರಿಯೆಗಳು",
      benefit3: "ಶಾಂತ ಮತ್ತು ಭರವಸೆಯ ವಿನ್ಯಾಸ",
      familyTitle: "ಕುಟುಂಬ ಸಂಪರ್ಕ",
      familyDesc:
        "ಕುಟುಂಬ ಸದಸ್ಯರು ಮತ್ತು ಆರೈಕೆದಾರರೊಂದಿಗೆ ಅಪ್ಡೇಟ್‌ಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
      familyLink: "ಕುಟುಂಬ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    },
    dashboard: {
      title: "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      demoReady: "ತಯಾರು",
      demoGreeting: "ಆಪ್ತ ಶುಭಾಶಯ ಹಂತ",
      demoChecklist: "ಚೆಕ್‌ಲಿಸ್ಟ್ ತೋರಿಸಲಾಗಿದೆ",
      demoHeart: "ಲೈವ್ ಹೃದಯ ಮಿಡಿತ ತೋರಿಸಲಾಗಿದೆ",
      demoAlert: "ಹೈ-ರಿಸ್ಕ್ ಅಲರ್ಟ್",
      demoSos: "SOS ಹೈಲೈಟ್",
      demoDone: "ಡೆಮೋ ಪೂರ್ಣ",
      demoLabel: "ಡೆಮೋ:",
      runDemo: "ಡೆಮೋ ಚಾಲನೆ ಮಾಡಿ",
      runningDemo: "ಡೆಮೋ ಚಾಲನೆ ಆಗುತ್ತಿದೆ...",
      upcoming: "ಮುಂದಿನವು",
      viewAll: "ಎಲ್ಲವನ್ನು ನೋಡಿ",
      reminderMorningMedicine: "ಬೆಳಗಿನ ಔಷಧ",
      reminderDoctorCall: "ಡಾಕ್ಟರ್ ವೀಡಿಯೊ ಕಾಲ್",
      reminderAfternoonMedicine: "ಮಧ್ಯಾಹ್ನದ ಔಷಧ",
      reminderEveningWalk: "ಸಂಜೆ ನಡಿಗೆ",
    },
    greeting: {
      morning: "ಶುಭೋದಯ",
      afternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
      evening: "ಶುಭ ಸಂಜೆ",
      message: "ಇಂದು ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ!",
    },
    checklist: {
      title: "ಇಂದಿನ ಚೆಕ್‌ಲಿಸ್ಟ್",
      offline: "ಆಫ್‌ಲೈನ್ ಮೋಡ್: ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ",
      synced: "Supabase ಜೊತೆಗೆ ಸಿಂಕ್ ಆಗಿದೆ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      medicineTaken: "ಔಷಧ ತೆಗೆದುಕೊಂಡೆ",
      medicineSubtitle: "ಮೆಟ್ಫಾರ್ಮಿನ್ 500mg + BP ಟ್ಯಾಬ್ಲೆಟ್",
      drankWater: "ನೀರು ಕುಡಿದೆ",
      waterSubtitle: "ಕನಿಷ್ಠ 4 ಗ್ಲಾಸ್",
      walked: "ನಡಿದೆ",
      walkedSubtitle: "30 ನಿಮಿಷ ಬೆಳಗಿನ ನಡಿಗೆ",
    },
    quickActions: {
      title: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
      callFamily: "ಕುಟುಂಬಕ್ಕೆ ಕರೆ",
      sos: "SOS ಅಲರ್ಟ್",
      orderMeds: "ಔಷಧ ಆರ್ಡರ್",
      playBhajan: "ಭಜನ್ ಚಾಲನೆ",
      emergencySent:
        "🚨 ತುರ್ತು ಅಲರ್ಟ್ ಕುಟುಂಬಕ್ಕೆ ಕಳುಹಿಸಲಾಗಿದೆ!",
    },
    health: {
      title: "ಆರೋಗ್ಯ ಮಾನಗಳು",
      lastUpdated: "ಕೊನೆಯ ನವೀಕರಣ",
      connecting: "ಆರೋಗ್ಯ ಸೆನ್ಸರ್‌ಗಳಿಗೆ ಸಂಪರ್ಕವಾಗುತ್ತಿದೆ...",
      highRisk: "⚠️ ಹೆಚ್ಚಿನ ಅಪಾಯ ಕಂಡುಬಂದಿದೆ",
      sitRelax:
        "ದಯವಿಟ್ಟು ಕುಳಿತು ವಿಶ್ರಾಂತಿ ಮಾಡಿ. ಕುಟುಂಬಕ್ಕೆ ಮಾಹಿತಿ ನೀಡಬಹುದು.",
      liveStatus: "ಲೈವ್ ಆರೋಗ್ಯ ಸ್ಥಿತಿ",
      risk: "ಅಪಾಯ",
      status: "ಸ್ಥಿತಿ: ಮಾನಿಟರಿಂಗ್ ಸಕ್ರಿಯ",
      safe: "ನೀವು ಸುರಕ್ಷಿತ ❤️",
      offline: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
      synced: "Supabase ಜೊತೆಗೆ ಸಿಂಕ್ ಆಗಿದೆ",
      sendUpdate: "ಕುಟುಂಬಕ್ಕೆ ಅಪ್ಡೇಟ್ ಕಳುಹಿಸಿ",
      updateLogged:
        "ಅಪ್ಡೇಟ್ ಕನ್ಸೋಲ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ (ಸಿಮ್ಯುಲೇಟೆಡ್).",
      alertPopup: "🔴 ಅಲರ್ಟ್ ಪಾಪ್‌ಅಪ್",
      monitoringText:
        "ದಯವಿಟ್ಟು ಕುಳಿತು ವಿಶ್ರಾಂತಿ ಮಾಡಿ. ನಾವು ನಿರಂತರವಾಗಿ ಮಾನಿಟರ್ ಮಾಡುತ್ತೇವೆ.",
      heartRate: "ಹೃದಯ ಮಿಡಿತ",
      dailySteps: "ದಿನದ ಹೆಜ್ಜೆಗಳು",
      sleep: "ನಿದ್ರೆ",
      medicine: "ಔಷಧ",
      taken: "ತೆಗೆದುಕೊಂಡಿದೆ",
      missed: "ಮಿಸ್",
      trendNormal: "ಸಾಮಾನ್ಯ",
      trendMonitoring: "ನಿರೀಕ್ಷೆ",
      trendExcellent: "ಅತ್ಯುತ್ತಮ",
      trendHigh: "ಹೆಚ್ಚು",
      trendLow: "ಕಡಿಮೆ",
      riskHigh: "ಹೆಚ್ಚು",
      riskNormal: "ಸಾಮಾನ್ಯ",
      riskLow: "ಕಡಿಮೆ",
    },
    mic: {
      label: "ತುಳಸಿಯ ಜೊತೆ ಮಾತನಾಡಿ",
      listening: "ಕೆಳಗುತ್ತಿದೆ...",
      guidance:
        "ಈಗ ಮಾತನಾಡಿ. ತುಳಸಿ ಔಷಧ, ಸುರಕ್ಷತೆ ಮತ್ತು ಶುಭಾಶಯ ಕಮಾಂಡ್‌ಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ.",
      noMic:
        "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ ಇಲ್ಲ. ಕೆಳಗಿನ ಕ್ವಿಕ್ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.",
      heard: "ಕೆಳಗಿನದು:",
      medicineBtn: "💊 ಔಷಧ ಜ್ಞಾಪನೆ",
      safetyBtn: "🛡️ ಸುರಕ್ಷತಾ ಸಂದೇಶ",
      greetingBtn: "👋 ಶುಭಾಶಯ",
    },
    footer: {
      description:
        "ಗೌರವಯುತ ಹಿರಿಯರ ಆರೈಕೆಗೆ AI ಸಂಗಾತಿ. ಭಾರತದಲ್ಲಿ ಪ್ರೀತಿಯಿಂದ ನಿರ್ಮಿತ 🇮🇳",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      support: "ಬೆಂಬಲ",
      emergency: "ತುರ್ತು",
      emergencyNumberLabel: "ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸಂಖ್ಯೆ",
      emergencyButton: "🚨 ಈಗ SOS ಕರೆ",
      rights:
        "© 2025 ತುಳಸಿರಕ್ಷ AI. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
      madeWith: "ಪ್ರೀತಿಯಿಂದ ನಿರ್ಮಿತ",
      forElders: "ಭಾರತೀಯ ಹಿರಿಯರಿಗಾಗಿ",
      featureVoice: "ವಾಯ್ಸ್ ಸಹಾಯಕ",
      featureMedicine: "ಔಷಧ ಜ್ಞಾಪನೆ",
      featureTracking: "ಆರೋಗ್ಯ ಟ್ರಾಕಿಂಗ್",
      featureFamily: "ಕುಟುಂಬ ಸಂಪರ್ಕ",
      featureSos: "SOS ಅಲರ್ಟ್",
      supportHelp: "ಸಹಾಯ ಕೇಂದ್ರ",
      supportContact: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
      supportPrivacy: "ಗೌಪ್ಯತೆ ನೀತಿ",
      supportTerms: "ಸೇವಾ ನಿಯಮಗಳು",
      supportAccess: "ಪ್ರವೇಶಾತ್ಮಕತೆ",
    },
  },

  HI: {
    nav: {
      home: "होम",
      reminders: "रिमाइंडर",
      health: "स्वास्थ्य",
      family: "परिवार",
      settings: "सेटिंग्स",
      profileSettings: "प्रोफाइल सेटिंग्स",
      logout: "लॉगआउट",
      loggingOut: "लॉगआउट हो रहा है...",
      login: "लॉगिन",
      signup: "साइन अप",
    },
    landing: {
      badge: "AI आधारित बुजुर्ग देखभाल साथी",
      title: "तुलसीरक्षा AI",
      subtitle1: "कभी अकेले नहीं।",
      subtitle2: "हमेशा देखभाल के साथ।",
      description:
        "बुजुर्गों के लिए एक स्नेहपूर्ण और सरल देखभाल साथी। स्वास्थ्य निगरानी, आवाज़ मार्गदर्शन, और परिवार का साथ एक ही अनुभव में।",
      getStarted: "शुरू करें",
      voiceAssistant: "वॉइस असिस्टेंट",
      youAreSafe: "आप सुरक्षित हैं ❤️",
      monitoringActive: "निगरानी सक्रिय",
      stopVoice: "आवाज़ बंद करें",
      speaking: "तुलसी बोल रही है…",
      voiceGuidance:
        "तुलसीरक्षा AI में आपका स्वागत है, बुजुर्गों के लिए आपका व्यक्तिगत स्वास्थ्य साथी। शुरू करने के लिए, हरे शुरू करें बटन पर क्लिक करें। यह आपको लॉगिन पेज पर ले जाएगा। अगर आपका पहले से अकाउंट है, तो अपना ईमेल और पासवर्ड डालें और लॉगिन पर क्लिक करें। अगर आप नए हैं, तो पेज के ऊपर दाईं तरफ साइन अप पर क्लिक करें। अपना नाम, ईमेल और पासवर्ड डालकर अकाउंट बनाएं। लॉगिन होने के बाद, आपको अपना हेल्थ डैशबोर्ड दिखेगा जिसमें दवा रिमाइंडर, स्वास्थ्य ट्रैकिंग और परिवार कनेक्शन की सुविधाएं होंगी।",
      featureVoiceTitle: "वॉइस असिस्टेंट",
      featureVoiceDesc:
        "रिमाइंडर और सुरक्षा के लिए परिचित भाषा में सरल आवाज़ मार्गदर्शन।",
      featureHealthTitle: "स्वास्थ्य निगरानी",
      featureHealthDesc:
        "स्पष्ट अलर्ट और परिवार सूचनाओं के साथ लाइव स्वास्थ्य ट्रैकिंग।",
      featureMedicineTitle: "दवा सहायता",
      featureMedicineDesc:
        "समझने में आसान चेक-इन के साथ समय पर रिमाइंडर।",
      benefitsTitle: "बुजुर्गों के लिए लाभ",
      benefit1: "बड़ा और पढ़ने में आसान इंटरफेस",
      benefit2: "त्वरित मदद के लिए एक-टैप क्रियाएं",
      benefit3: "शांत और भरोसेमंद डिज़ाइन",
      familyTitle: "परिवार कनेक्शन",
      familyDesc:
        "परिवार के सदस्यों और देखभालकर्ताओं के साथ अपडेट साझा करें।",
      familyLink: "परिवार सुविधाएं देखें",
    },
    page: {
      connecting: "हेल्थ सेंसर से कनेक्ट हो रहा है...",
      syncTitle: "डिवाइस में सिंक के लिए लॉगिन करें",
      offlineText:
        "ऑफलाइन डेमो मोड चालू है। आप सुरक्षित हैं ❤️",
      goLogin: "लॉगिन पर जाएँ",
    },
    hero: {
      badge: "AI आधारित बुजुर्ग देखभाल साथी",
      sub1: "कभी अकेले नहीं।",
      sub2: "हमेशा देखभाल के साथ।",
      description:
        "बुजुर्गों के लिए एक स्नेहपूर्ण और सरल देखभाल साथी। स्वास्थ्य निगरानी, आवाज़ मार्गदर्शन, और परिवार का साथ एक ही अनुभव में।",
      ctaPrimary: "फ्री शुरू करें",
      ctaSecondary: "वॉइस असिस्टेंट",
      trustFamilies: "10,000+ परिवार हम पर भरोसा करते हैं",
      hipaa: "HIPAA कम्प्लायंट",
      madeInIndia: "भारत में निर्मित",
      youAreSafe: "आप सुरक्षित हैं ❤️",
      monitoringActive: "निगरानी सक्रिय",
      featureVoiceTitle: "वॉइस असिस्टेंट",
      featureVoiceDesc:
        "रिमाइंडर और सुरक्षा के लिए परिचित भाषा में सरल आवाज़ मार्गदर्शन।",
      featureHealthTitle: "स्वास्थ्य निगरानी",
      featureHealthDesc:
        "स्पष्ट अलर्ट और परिवार सूचनाओं के साथ लाइव स्वास्थ्य ट्रैकिंग।",
      featureMedicineTitle: "दवा सहायता",
      featureMedicineDesc:
        "समझने में आसान चेक-इन के साथ समय पर रिमाइंडर।",
      benefitsTitle: "बुजुर्गों के लिए लाभ",
      benefit1: "बड़ा और पढ़ने में आसान इंटरफेस",
      benefit2: "त्वरित मदद के लिए एक-टैप क्रियाएं",
      benefit3: "शांत और भरोसेमंद डिज़ाइन",
      familyTitle: "परिवार कनेक्शन",
      familyDesc:
        "परिवार के सदस्यों और देखभालकर्ताओं के साथ अपडेट साझा करें।",
      familyLink: "परिवार सुविधाएं देखें",
    },
    dashboard: {
      title: "आपका डैशबोर्ड",
      demoReady: "तैयार",
      demoGreeting: "भावनात्मक शुरुआत",
      demoChecklist: "चेकलिस्ट दिखी",
      demoHeart: "लाइव हार्ट रेट दिखा",
      demoAlert: "हाई-रिस्क अलर्ट",
      demoSos: "SOS हाइलाइट",
      demoDone: "डेमो पूरा",
      demoLabel: "डेमो:",
      runDemo: "डेमो चलाएँ",
      runningDemo: "डेमो चल रहा है...",
      upcoming: "आगामी",
      viewAll: "सब देखें",
      reminderMorningMedicine: "सुबह की दवा",
      reminderDoctorCall: "डॉक्टर वीडियो कॉल",
      reminderAfternoonMedicine: "दोपहर की दवा",
      reminderEveningWalk: "शाम की वॉक",
    },
    greeting: {
      morning: "सुप्रभात",
      afternoon: "शुभ दोपहर",
      evening: "शुभ संध्या",
      message: "आप आज बहुत अच्छा कर रहे हैं!",
    },
    checklist: {
      title: "आज की चेकलिस्ट",
      offline: "ऑफलाइन मोड: इस डिवाइस में सेव",
      synced: "Supabase के साथ सिंक",
      completed: "पूरा",
      medicineTaken: "दवा ली",
      medicineSubtitle: "मेटफॉर्मिन 500mg + BP टैबलेट",
      drankWater: "पानी पिया",
      waterSubtitle: "कम से कम 4 गिलास",
      walked: "वॉक की",
      walkedSubtitle: "30 मिनट सुबह की वॉक",
    },
    quickActions: {
      title: "त्वरित कार्य",
      callFamily: "परिवार को कॉल",
      sos: "SOS अलर्ट",
      orderMeds: "दवा ऑर्डर",
      playBhajan: "भजन चलाएँ",
      emergencySent:
        "🚨 इमरजेंसी अलर्ट परिवार को भेजा गया!",
    },
    health: {
      title: "हेल्थ वाइटल्स",
      lastUpdated: "अंतिम अपडेट",
      connecting: "हेल्थ सेंसर से कनेक्ट हो रहा है...",
      highRisk: "⚠️ उच्च जोखिम पाया गया",
      sitRelax:
        "कृपया बैठकर आराम करें। परिवार को सूचना दी जा सकती है।",
      liveStatus: "लाइव हेल्थ स्टेटस",
      risk: "जोखिम",
      status: "स्थिति: मॉनिटरिंग सक्रिय",
      safe: "आप सुरक्षित हैं ❤️",
      offline: "ऑफलाइन मोड",
      synced: "Supabase के साथ सिंक",
      sendUpdate: "परिवार को अपडेट भेजें",
      updateLogged:
        "अपडेट कंसोल में लॉग हुआ (सिम्युलेटेड)।",
      alertPopup: "🔴 अलर्ट पॉपअप",
      monitoringText:
        "कृपया बैठकर आराम करें। हम लगातार मॉनिटर कर रहे हैं।",
      heartRate: "हार्ट रेट",
      dailySteps: "दैनिक कदम",
      sleep: "नींद",
      medicine: "दवा",
      taken: "ली",
      missed: "छूटी",
      trendNormal: "सामान्य",
      trendMonitoring: "निगरानी",
      trendExcellent: "बेहतरीन",
      trendHigh: "उच्च",
      trendLow: "कम",
      riskHigh: "उच्च",
      riskNormal: "सामान्य",
      riskLow: "कम",
    },
    mic: {
      label: "तुलसी से बात करें",
      listening: "सुन रहा है...",
      guidance:
        "अब बोलें। तुलसी दवा, सुरक्षा और ग्रीटिंग कमांड समझेगी।",
      noMic:
        "इस ब्राउज़र में माइक सपोर्ट नहीं है। नीचे बटन इस्तेमाल करें।",
      heard: "सुना गया:",
      medicineBtn: "💊 दवा रिमाइंडर",
      safetyBtn: "🛡️ सुरक्षा संदेश",
      greetingBtn: "👋 अभिवादन",
    },
    footer: {
      description:
        "सम्मानजनक बुजुर्ग देखभाल के लिए AI साथी। भारत में प्यार से निर्मित 🇮🇳",
      features: "फीचर्स",
      support: "सहायता",
      emergency: "आपातकाल",
      emergencyNumberLabel: "राष्ट्रीय आपातकाल नंबर",
      emergencyButton: "🚨 अभी SOS कॉल",
      rights: "© 2025 तुलसीरक्षा AI. सर्वाधिकार सुरक्षित।",
      madeWith: "प्यार से बना",
      forElders: "भारतीय बुजुर्गों के लिए",
      featureVoice: "वॉइस असिस्टेंट",
      featureMedicine: "दवा रिमाइंडर",
      featureTracking: "हेल्थ ट्रैकिंग",
      featureFamily: "फैमिली कनेक्ट",
      featureSos: "SOS अलर्ट",
      supportHelp: "हेल्प सेंटर",
      supportContact: "संपर्क करें",
      supportPrivacy: "प्राइवेसी पॉलिसी",
      supportTerms: "सेवा की शर्तें",
      supportAccess: "एक्सेसिबिलिटी",
    },
  },
};

const I18nContext = createContext(null);

function resolveValue(object, path) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && key in acc ? acc[key] : null),
      object
    );
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "EN";
    const saved = localStorage.getItem("tulsi_lang");
    return saved && DICTIONARY[saved] ? saved : "EN";
  });

  useEffect(() => {
    localStorage.setItem("tulsi_lang", language);
  }, [language]);

  const value = useMemo(() => {
    const t = (key) => {
      const selected = DICTIONARY[language] || DICTIONARY.EN;
      return (
        resolveValue(selected, key) ||
        resolveValue(DICTIONARY.EN, key) ||
        key
      );
    };

    return { language, setLanguage, languages: LANGUAGE_OPTIONS, t };
  }, [language]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}