import { supabase } from "@/lib/supabaseClient";

/**
 * Voice Health Integration
 * Generates contextual voice messages based on real-time health data
 */

export const voiceMessages = {
  greeting: {
    morning:
      "Good morning! I'm here with you. How are you feeling today?",
    afternoon:
      "Good afternoon! I hope you're doing well. How can I help you?",
    evening:
      "Good evening! Let's check in on your health. How are you doing?",
  },

  healthStatus: {
    normal:
      "Your health looks good. Keep up the great work with your daily activities!",
    warning:
      "I've noticed some changes in your vitals. Please take it easy and stay hydrated.",
    critical:
      "Your health metrics show a concerning trend. I'm notifying your family now.",
  },

  reminders: {
    medicine: "It's time to take your medicine. Please take it now.",
    exercise:
      "Let's get some light activity. A short walk can help you feel better.",
    hydration: "Remember to drink some water. Staying hydrated is important.",
    checkup:
      "It's been a while since your last health check-up. Please consult your doctor.",
  },

  motivation: {
    positive: [
      "You're doing wonderfully! I'm proud of you.",
      "Great job staying active today!",
      "Your dedication to your health is inspiring.",
      "You're taking excellent care of yourself.",
    ],
    support: [
      "I'm here for you whenever you need support.",
      "Remember, you're not alone in this journey.",
      "Let's take this one step at a time together.",
      "Your wellbeing matters to me.",
    ],
  },
};

/**
 * Generate a contextual voice message based on health data
 */
export const generateHealthMessage = (healthData, userName = "Friend") => {
  if (!healthData) return null;

  const { heart_rate, blood_pressure, steps, risk_level } = healthData;

  // Status-based message
  let statusMessage = voiceMessages.healthStatus.normal;

  if (risk_level === "CRITICAL") {
    statusMessage = voiceMessages.healthStatus.critical;
  } else if (risk_level === "HIGH") {
    statusMessage = voiceMessages.healthStatus.warning;
  }

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = voiceMessages.greeting.morning;
  if (hour >= 12 && hour < 18) {
    greeting = voiceMessages.greeting.afternoon;
  } else if (hour >= 18) {
    greeting = voiceMessages.greeting.evening;
  }

  // Compose message based on vitals
  let vitalMessage = "";
  if (heart_rate) {
    vitalMessage += `Your heart rate is ${heart_rate} beats per minute. `;
  }
  if (steps) {
    vitalMessage += `You've taken ${steps} steps today. `;
  }

  return `${greeting} ${vitalMessage} ${statusMessage}`;
};

/**
 * Get greeting message with user's name
 */
export const getGreeting = (userName = "Friend") => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${userName}! I'm here with you. How are you feeling today?`;
  } else if (hour < 18) {
    return `Good afternoon, ${userName}! I hope you're taking care of yourself today.`;
  } else {
    return `Good evening, ${userName}! Let's check in on how you're doing.`;
  }
};

/**
 * Fetch health data and generate voice message
 */
export const getHealthDataVoiceMessage = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return getGreeting();
    }

    return generateHealthMessage(data);
  } catch (error) {
    console.error("Error fetching health data for voice:", error);
    return getGreeting();
  }
};

/**
 * Get recommended message based on user activity
 */
export const getContextualMessage = (context, userName = "Friend") => {
  const messages = {
    login: `Welcome back, ${userName}! I'm here to support your health journey.`,
    riskDetected: `${userName}, I've detected a health concern. Your family has been notified.`,
    reminderMissed: `${userName}, you missed your reminder. Would you like me to remind you again?`,
    achievementUnlocked: `Great job, ${userName}! You've reached a new health milestone!`,
    bedtime: `${userName}, it's getting late. Make sure to get good rest tonight.`,
    morningCheckup: `${userName}, let's start the day with a quick health check. How are your vitals?`,
  };

  return messages[context] || null;
};

/**
 * Subscribe to real-time health updates and trigger voice
 */
export const subscribeToHealthUpdates = (userId, onNewData) => {
  const subscription = supabase
    .from("health_data")
    .on("INSERT", (payload) => {
      if (payload.new.user_id === userId) {
        onNewData(payload.new);
      }
    })
    .subscribe();

  return subscription;
};

/**
 * Check if voice message should be triggered based on health data
 */
export const shouldTriggerVoice = (healthData, lastTriggerTime = null) => {
  // Don't trigger more than once per 10 minutes
  if (lastTriggerTime) {
    const timeSinceLastTrigger = Date.now() - lastTriggerTime;
    if (timeSinceLastTrigger < 10 * 60 * 1000) {
      return false;
    }
  }

  // Trigger for critical health alerts
  if (healthData?.risk_level === "CRITICAL" || healthData?.risk_level === "HIGH") {
    return true;
  }

  return false;
};
