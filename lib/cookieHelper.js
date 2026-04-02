import { setCookie, getCookie, deleteCookie } from 'cookies-next';

// Save WhatsApp notification preferences in cookies
export const saveNotificationPrefs = (data) => {
  setCookie('wa_phone', data.phone, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
  setCookie('wa_name', data.name, { maxAge: 60 * 60 * 24 * 30 });
  setCookie('wa_relation', data.relation, { maxAge: 60 * 60 * 24 * 30 });
  setCookie('wa_enabled', 'true', { maxAge: 60 * 60 * 24 * 30 });
};

// Read preferences from cookies
export const getNotificationPrefs = () => {
  return {
    phone: getCookie('wa_phone') || '',
    name: getCookie('wa_name') || '',
    relation: getCookie('wa_relation') || '',
    enabled: getCookie('wa_enabled') === 'true',
  };
};

// Save latest health snapshot in cookie (temporary, no DB)
export const saveHealthSnapshot = (healthData) => {
  setCookie('health_snapshot', JSON.stringify(healthData), {
    maxAge: 60 * 60, // 1 hour — fresh data only
  });
};

// Read health snapshot
export const getHealthSnapshot = () => {
  const raw = getCookie('health_snapshot');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Clear all notification cookies
export const clearNotificationPrefs = () => {
  deleteCookie('wa_phone');
  deleteCookie('wa_name');
  deleteCookie('wa_relation');
  deleteCookie('wa_enabled');
  deleteCookie('health_snapshot');
};