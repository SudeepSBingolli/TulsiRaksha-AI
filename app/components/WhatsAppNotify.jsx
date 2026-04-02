'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { setCookie, getCookie } from 'cookies-next';

export default function WhatsAppNotify({ missedTasks = [], patientName = "Elder" }) {
  const [phone, setPhone] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [relation, setRelation] = useState('');
  const [status, setStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [alertedTasks, setAlertedTasks] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef(null);

  // ─── Load saved preferences on mount ───
  useEffect(() => {
    const savedPhone = getCookie('wa_phone') || '';
    const savedName = getCookie('wa_family_name') || '';
    const savedRelation = getCookie('wa_relation') || '';
    setPhone(savedPhone);
    setFamilyName(savedName);
    setRelation(savedRelation);

    if (!savedPhone) setShowSettings(true);

    try {
      const savedAlerts = getCookie('wa_alerted_tasks');
      if (savedAlerts) {
        setAlertedTasks(JSON.parse(savedAlerts));
      }
    } catch {
      setAlertedTasks({});
    }
  }, []);

  // ─── 10-second timer to check deadlines (Faster Auto-Trigger) ───
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Checks every 10 seconds now

    return () => clearInterval(intervalRef.current);
  }, []);

  const parseTaskTime = useCallback((timeStr) => {
    if (!timeStr) return null;
    try {
      const now = new Date();
      const clean = timeStr.trim().toUpperCase();
      let hours, minutes;

      if (clean.includes('AM') || clean.includes('PM')) {
        const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
        if (!match) return null;
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        const period = match[3];
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      } else {
        const parts = clean.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1] || '0');
      }

      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    } catch {
      return null;
    }
  }, []);

  // ─── THE NATIVE WHATSAPP APP OPENER ───
  const openWhatsAppDirectly = (phoneNumber, messageText) => {
    const encodedMessage = encodeURIComponent(messageText);
    
    // FORCE the native WhatsApp Application
    const waLink = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;

    // Create invisible anchor to trigger app launch silently
    const link = document.createElement('a');
    link.href = waLink;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── 🚨 THE AUTOMATIC TRIGGER 🚨 ───
  useEffect(() => {
    const savedPhone = getCookie('wa_phone');
    if (!savedPhone || missedTasks.length === 0) return;

    const now = currentTime;
    const todayKey = now.toISOString().split('T')[0];

    // Find ALL tasks that crossed the deadline just now and haven't been alerted yet
    const newlyOverdueTasks = missedTasks.filter((task) => {
      const taskId = task.id || task.title || task.label || task.text;
      const alertKey = `${todayKey}_${taskId}`;
      
      // Skip if already alerted today
      if (alertedTasks[alertKey]) return false;

      const deadline = parseTaskTime(task.time);
      if (!deadline) return false;

      // Has the current time passed the deadline?
      return now > deadline;
    });

    // If there are new tasks that just crossed the deadline, AUTOMATICALLY open WhatsApp
    if (newlyOverdueTasks.length > 0) {
      
      const taskListString = newlyOverdueTasks
        .map(t => `- ${t.title || t.label || t.text} (Deadline: ${t.time})`)
        .join('\n');

      const message = 
`*TulsiRaksha-AI — Auto Alert*

*Patient:* ${patientName}
*Time:* ${now.toLocaleTimeString()}

---
*MISSED TASKS:*
${taskListString}
---

Please check on them immediately.
- TulsiRaksha AI`;

      // 🔥 AUTOMATICALLY FIRE WHATSAPP (No button press needed!)
      openWhatsAppDirectly(savedPhone, message);

      // Save them as "Alerted" so it doesn't open WhatsApp again 10 seconds later
      const updatedAlerts = { ...alertedTasks };
      newlyOverdueTasks.forEach((t) => {
        const taskId = t.id || t.title || t.label || t.text;
        updatedAlerts[`${todayKey}_${taskId}`] = {
          sentAt: now.toISOString(),
          task: t.title || t.label || t.text,
          deadline: t.time,
        };
      });

      setAlertedTasks(updatedAlerts);
      setCookie('wa_alerted_tasks', JSON.stringify(updatedAlerts), {
        maxAge: 60 * 60 * 24, 
      });

      setStatus(`🚨 Automatically alerted for ${newlyOverdueTasks.length} task(s)!`);
    }
  }, [currentTime, missedTasks, alertedTasks, patientName, parseTaskTime]);

  const savePreferences = () => {
    if (!phone.trim()) {
      setStatus('❌ Please enter a phone number');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    setCookie('wa_phone', cleanPhone, { maxAge: 60 * 60 * 24 * 30 });
    setCookie('wa_family_name', familyName, { maxAge: 60 * 60 * 24 * 30 });
    setCookie('wa_relation', relation, { maxAge: 60 * 60 * 24 * 30 });
    setStatus('✅ Saved! Auto-alerts are now active.');
    setShowSettings(false);
    setTimeout(() => setStatus(''), 3000);
  };

  const resetAlerts = () => {
    setAlertedTasks({});
    setCookie('wa_alerted_tasks', JSON.stringify({}), { maxAge: 60 * 60 * 24 });
    setStatus('🔄 Alerts reset — wait 10 seconds to auto-trigger again');
    setTimeout(() => setStatus(''), 3000);
  };

  const manualSend = () => {
    const savedPhone = getCookie('wa_phone');
    if (!savedPhone) {
      setStatus('❌ Save a phone number first!');
      setShowSettings(true);
      return;
    }
    const now = new Date();
    const overdueTasks = missedTasks.filter((task) => {
      const deadline = parseTaskTime(task.time);
      return deadline && now > deadline;
    });

    if (overdueTasks.length === 0) return;
    const taskList = overdueTasks.map((task, i) => ` ${i + 1}. ${task.title || task.label || task.text} (${task.time})`).join('\n');
    const message = `*TulsiRaksha-AI — Manual Alert*\n\n*Patient:* ${patientName}\n*Time:* ${now.toLocaleTimeString()}\n\n---\n*OVERDUE TASKS:*\n${taskList}\n---\n\nPlease check on them.\n- TulsiRaksha AI`;

    openWhatsAppDirectly(savedPhone, message);
    setStatus(`📱 Sent ${overdueTasks.length} overdue task alerts!`);
    setTimeout(() => setStatus(''), 3000);
  };

  const now = currentTime;
  const overdueTasks = missedTasks.filter((task) => {
    const deadline = parseTaskTime(task.time);
    return deadline && now > deadline;
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-lg shadow-gray-100/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          📱 WhatsApp Auto-Alert
        </h3>
        <button onClick={() => setShowSettings(!showSettings)} className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
          {showSettings ? '✕ Close' : '⚙️ Settings'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${getCookie('wa_phone') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">
          {getCookie('wa_phone') ? 'Auto-alerts active — checking every 10s' : 'Set phone number to enable auto-alerts'}
        </span>
      </div>

      {showSettings && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Family Phone (with country code)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 919876543210" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
          <button onClick={savePreferences} className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all">
            💾 Save & Enable Auto-Alerts
          </button>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <p className="font-bold text-red-800 mb-2 text-sm flex items-center gap-2">🚨 {overdueTasks.length} Task{overdueTasks.length > 1 ? 's' : ''} Past Deadline</p>
            <ul className="text-sm text-red-700 space-y-1">
              {overdueTasks.map((task, idx) => {
                const title = task.title || task.label || task.text;
                const taskId = task.id || title;
                const wasAlerted = !!alertedTasks[`${now.toISOString().split('T')[0]}_${taskId}`];
                return (
                  <li key={taskId || idx} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><span>❌</span><span>{title}</span><span className="text-red-400 text-xs">({task.time})</span></span>
                    {wasAlerted ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Alerted</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full animate-pulse">⏳ Alerting...</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {overdueTasks.length > 0 && (
          <button onClick={manualSend} className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all">
            🚨 Send All Overdue Alerts Now ({overdueTasks.length})
          </button>
        )}
        <button onClick={resetAlerts} className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium text-xs transition-all">
          🔄 Reset Alerts (for testing)
        </button>
      </div>

      {status && <p className="mt-3 text-center text-sm font-semibold text-emerald-600">{status}</p>}
    </div>
  );
}