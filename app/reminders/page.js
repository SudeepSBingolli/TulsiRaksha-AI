'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link' // Added for Navbar component usage, though not used in RemindersPage directly
import { usePathname } from 'next/navigation' // Added for Navbar component usage, though not used in RemindersPage directly

/* ══════════════════════════════════════════
   GLOBAL STYLES
   (Note: For a full Tailwind project, consider converting these
   to Tailwind classes or using a dedicated CSS file)
   ══════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(100%); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOverlay {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pop {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .fade-in { animation: fadeIn 0.5s ease forwards; }
      .fade-d1 { opacity:0; animation: fadeIn 0.5s ease 0.05s forwards; }
      .fade-d2 { opacity:0; animation: fadeIn 0.5s ease 0.1s forwards; }
      .fade-d3 { opacity:0; animation: fadeIn 0.5s ease 0.15s forwards; }

      .overlay {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(6px);
        display: flex; align-items: flex-end; justify-content: center;
        animation: fadeOverlay 0.25s ease;
      }
      @media (min-width: 640px) {
        .overlay { align-items: center; }
      }

      .modal {
        background: #fff;
        border-radius: 28px 28px 0 0;
        width: 100%; max-width: 520px;
        max-height: 92vh; overflow-y: auto;
        animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
      }
      @media (min-width: 640px) {
        .modal {
          border-radius: 28px;
          animation: pop 0.35s cubic-bezier(0.16,1,0.3,1);
        }
      }

      .r-card {
        transition: all 0.25s ease;
        cursor: default;
      }
      .r-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.05);
      }

      .del-btn {
        opacity: 0; transition: opacity 0.2s;
      }
      .r-card:hover .del-btn {
        opacity: 1;
      }

      /* Using Inter font from _app or global CSS */
      input, textarea, select {
        font-family: inherit; /* Use inherited font, typically Inter */
      }
      input:focus, textarea:focus {
        outline: none;
        border-color: #10b981 !important;
      }

      ::selection { background: #d1fae5; color: #065f46; }
      /* Button font family is already inherited */

      .listening-ring {
        animation: pulse-ring 1.2s ease-out infinite;
      }
      @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
        100% { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
      }

      @media (max-width: 639px) {
        .page-header-row { flex-direction: column !important; align-items: stretch !important; }
      }
    `}</style>
  )
}

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function getStatus(timeStr) {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date()
  target.setHours(h, m, 0, 0)

  const diffMin = (target.getTime() - now.getTime()) / 60000 // Use getTime() for consistency

  if (diffMin < -5) return 'missed' // If it's been more than 5 mins past the time
  if (diffMin < 30) return 'soon'   // If it's within 30 mins
  return 'plenty'                   // Otherwise
}

const STATUS_CONFIG = {
  missed: {
    bg: '#fef2f2',
    border: '#fecaca',
    accent: '#dc2626',
    dot: '#ef4444',
    label: 'Missed',
    labelBg: '#fee2e2',
    labelColor: '#991b1b',
    stripe: '#fca5a5',
  },
  soon: {
    bg: '#fffbeb',
    border: '#fde68a',
    accent: '#d97706',
    dot: '#f59e0b',
    label: 'Due Soon',
    labelBg: '#fef3c7',
    labelColor: '#92400e',
    stripe: '#fbbf24',
  },
  plenty: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#16a34a',
    dot: '#22c55e',
    label: 'On Track',
    labelBg: '#dcfce7',
    labelColor: '#166534',
    stripe: '#4ade80',
  },
  done: {
    bg: '#fafafa',
    border: '#e5e7eb',
    accent: '#9ca3af',
    dot: '#d1d5db',
    label: 'Done ✓',
    labelBg: '#f3f4f6',
    labelColor: '#6b7280',
    stripe: '#d1d5db',
  },
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function nowTimeStr() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

/* ══════════════════════════════════════════
   INITIAL DATA
   ══════════════════════════════════════════ */
const SEED = [
  { id: 1, name: 'Morning Medicine', desc: 'Metformin 500mg + BP tablet — take after breakfast', time: '08:00', done: false },
  { id: 2, name: 'Drink Water', desc: 'At least one full glass of warm water', time: '09:00', done: false },
  { id: 3, name: 'Morning Walk', desc: '20 minutes gentle walk in the park or terrace', time: '10:00', done: false },
  { id: 4, name: 'Lunch Medicine', desc: 'Calcium tablet + Vitamin D3 after lunch', time: '13:00', done: false },
  { id: 5, name: 'Call Priya', desc: 'Video call with daughter — she asked to call today', time: '14:30', done: false },
  { id: 6, name: 'Evening Snack', desc: 'Light snack — fruits, biscuits, or chai', time: '16:00', done: false },
  { id: 7, name: 'Evening Walk', desc: '15 minutes slow walk — good for digestion', time: '17:30', done: false },
  { id: 8, name: 'Night Medicine', desc: 'BP medicine + sleep aid tablet before bed', time: '21:00', done: false },
]

/* ══════════════════════════════════════════
   REMINDER CARD
   ══════════════════════════════════════════ */
function ReminderCard({ r, onToggle, onDelete }) {
  const status = r.done ? 'done' : getStatus(r.time)
  const c = STATUS_CONFIG[status]

  return (
    <div className="r-card" style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderLeft: `5px solid ${c.stripe}`,
      borderRadius: 18,
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      position: 'relative',
    }}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(r.id)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          border: r.done ? 'none' : `2.5px solid ${c.accent}`,
          backgroundColor: r.done ? '#d1d5db' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: 2,
          transition: 'all 0.25s ease',
        }}
        aria-label={r.done ? 'Mark as undone' : 'Mark as done'}
      >
        {r.done && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* ========== FIX 1: h3 element ========== */}
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: r.done ? '#9ca3af' : '#111827',
            textDecorationLine: r.done ? 'line-through' : 'none',
            textDecorationColor: '#d1d5db',
            textDecorationStyle: 'solid',
            lineHeight: 1.3,
          }}>
            {r.name}
          </h3>

          {/* Status pill */}
          <span style={{
            padding: '3px 10px',
            borderRadius: 8,
            backgroundColor: c.labelBg,
            color: c.labelColor,
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {c.label}
          </span>
        </div>

        {/* ========== FIX 2: p element ========== */}
        <p style={{
          fontSize: 15,
          color: r.done ? '#b5b5b5' : '#6b7280',
          marginTop: 6,
          lineHeight: 1.5,
          fontWeight: 500,
          textDecorationLine: r.done ? 'line-through' : 'none',
          textDecorationColor: '#e5e7eb',
          textDecorationStyle: 'solid',
        }}>
          {r.desc}
        </p>

        {/* Time */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          padding: '4px 12px',
          borderRadius: 8,
          backgroundColor: r.done ? '#f3f4f6' : 'rgba(255,255,255,0.7)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.done ? '#b5b5b5' : c.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: r.done ? '#b5b5b5' : c.accent,
          }}>
            {formatTime(r.time)}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        className="del-btn"
        onClick={() => onDelete(r.id)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: 'none',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          fontSize: 16,
          transition: 'all 0.2s',
        }}
        aria-label="Delete reminder"
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fecaca' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fee2e2' }}
      >
        ✕
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════
   ADD REMINDER MODAL
   ══════════════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [mode, setMode] = useState(null) // null | 'manual' | 'voice'
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [time, setTime] = useState(nowTimeStr())
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('') // Separate state for voice error
  const recognitionRef = useRef(null)

  // Clean up speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  // Voice recognition handlers
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use a Chromium-based browser like Chrome or Edge.')
      setVoiceError('Voice input not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false // Set to false to get a single result then stop
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setTranscript('') // Clear previous transcript on start
      setVoiceError('') // Clear previous voice error
    }

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(interimTranscript);

      if (event.results[0].isFinal) {
        setListening(false);
        setTranscript(interimTranscript.trim()); // Ensure final transcript is trimmed
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setVoiceError('Voice input failed: ' + event.error + '. Try again.') // Using local state for error
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
      // Only set error if there was no transcript, implying failure
      if (!transcript.trim() && !voiceError) { // Check voiceError to avoid overwriting specific errors
        setVoiceError('No speech detected or could not understand.')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [transcript, voiceError]) // Depend on transcript to ensure latest state is used in onend

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setListening(false)
  }, [])

  const useTranscript = () => {
    if (transcript.trim()) {
      setName(transcript.trim())
      setMode('manual')
      setTranscript('') // Clear transcript after using it
      setVoiceError('') // Clear any voice error
    }
  }

  const handleAdd = () => {
    if (!name.trim()) {
      setVoiceError('Reminder name cannot be empty.') // Use voiceError for consistency
      return
    }
    onAdd({
      id: Date.now(),
      name: name.trim(),
      desc: desc.trim() || 'No description provided.',
      time,
      done: false,
    })
    onClose()
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: '2px solid #f3f4f6',
    fontSize: 17,
    fontWeight: 500,
    backgroundColor: '#fafafa',
    color: '#111827',
    transition: 'border-color 0.2s',
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '24px 28px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>
            {mode === 'voice' ? '🎤 Voice Input' : mode === 'manual' ? '✏️ New Reminder' : '➕ Add Reminder'}
          </h2>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#6b7280',
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 28px 32px' }}>
          {voiceError && ( // Display voice error
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 15,
              fontWeight: 500,
            }}>
              {voiceError}
            </div>
          )}

          {/* Step 1 — Choose mode */}
          {mode === null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 16, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>
                How would you like to add a reminder?
              </p>

              {/* Voice option */}
              <button
                onClick={() => {setMode('voice'); setVoiceError('')}} // Clear error when switching mode
                style={{
                  width: '100%',
                  padding: '24px',
                  borderRadius: 20,
                  border: '2px solid #a7f3d0',
                  backgroundColor: '#ecfdf5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d1fae5'; e.currentTarget.style.borderColor = '#6ee7b7' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.borderColor = '#a7f3d0' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" stroke="none">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 19, fontWeight: 700, color: '#065f46' }}>Voice to Text</p>
                  <p style={{ fontSize: 14, color: '#059669', fontWeight: 500, marginTop: 2 }}>
                    Speak your reminder — we'll write it down
                  </p>
                </div>
              </button>

              {/* Manual option */}
              <button
                onClick={() => {setMode('manual'); setVoiceError('')}} // Clear error when switching mode
                style={{
                  width: '100%',
                  padding: '24px',
                  borderRadius: 20,
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: '#111827',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 26 }}>✏️</span>
                </div>
                <div>
                  <p style={{ fontSize: 19, fontWeight: 700, color: '#111827' }}>Type Manually</p>
                  <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>
                    Fill in the name, description & time
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Voice mode */}
          {mode === 'voice' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 500, marginBottom: 24 }}>
                {listening
                  ? 'Listening... speak clearly'
                  : transcript
                  ? 'Here\'s what we heard:'
                  : 'Tap the microphone and say your reminder'}
              </p>

              {/* Mic button */}
              <button
                onClick={listening ? stopListening : startListening}
                className={listening ? 'listening-ring' : ''}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: listening ? '#ef4444' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  transition: 'background-color 0.3s',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>

              <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12, fontWeight: 500 }}>
                {listening ? 'Tap to stop' : 'Tap to start'}
              </p>

              {/* Transcript */}
              {transcript && (
                <div style={{
                  marginTop: 24,
                  padding: '16px 20px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 16,
                  textAlign: 'left',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Recognized Text
                  </p>
                  <p style={{ fontSize: 17, color: '#111827', fontWeight: 600, lineHeight: 1.5 }}>
                    &ldquo;{transcript}&rdquo;
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => { setMode(null); setTranscript(''); stopListening(); setVoiceError('') }} style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  backgroundColor: '#f3f4f6', color: '#6b7280',
                  fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>
                  ← Back
                </button>
                {transcript && (
                  <button onClick={useTranscript} style={{
                    flex: 2, padding: '14px', borderRadius: 14,
                    backgroundColor: '#10b981', color: '#fff',
                    fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    Use this → Fill details
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step: Manual form */}
          {mode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Reminder Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Take morning medicine"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g., Metformin 500mg after breakfast"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Time */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Time <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => { setMode(null); setName(''); setDesc(''); setTranscript(''); setVoiceError('') }} style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  backgroundColor: '#f3f4f6', color: '#6b7280',
                  fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>
                  ← Back
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim()}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 14,
                    backgroundColor: name.trim() ? '#10b981' : '#d1d5db',
                    color: '#fff',
                    fontSize: 17, fontWeight: 700, border: 'none',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (name.trim()) e.currentTarget.style.backgroundColor = '#059669' }}
                  onMouseLeave={e => { if (name.trim()) e.currentTarget.style.backgroundColor = '#10b981' }}
                >
                  ✓ Add Reminder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════ */
function EmptyState({ onAdd }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 24px',
      backgroundColor: '#fff',
      borderRadius: 24,
      border: '1px solid #f3f4f6',
    }}>
      <span style={{ fontSize: 56 }}>🔔</span>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 16 }}>
        No reminders yet
      </p>
      <p style={{ fontSize: 16, color: '#9ca3af', marginTop: 8, maxWidth: 320, margin: '8px auto 0' }}>
        Add your first reminder to start tracking your daily wellness
      </p>
      <button onClick={onAdd} style={{
        marginTop: 24, padding: '14px 32px', borderRadius: 16,
        backgroundColor: '#10b981', color: '#fff',
        fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
      >
        + Add Reminder
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════
   LEGEND
   ══════════════════════════════════════════ */
function Legend() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      padding: '12px 20px', backgroundColor: '#fff',
      borderRadius: 14, border: '1px solid #f3f4f6',
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Legend:</span>
      {[
        { label: 'On Track', color: '#22c55e', bg: '#dcfce7' },
        { label: 'Due Soon', color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Missed', color: '#ef4444', bg: '#fee2e2' },
        { label: 'Done', color: '#9ca3af', bg: '#f3f4f6' },
      ].map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: l.color }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{l.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
export default function RemindersPage() {
  const [reminders, setReminders] = useState(SEED)
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Re-render every minute to update colors based on time
  const [, setTick] = useState(0)
  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const toggleDone = useCallback((id) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    ))
  }, [])

  const deleteReminder = useCallback((id) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }, [])

  const addReminder = useCallback((newR) => {
    setReminders(prev =>
      [...prev, newR].sort((a, b) => a.time.localeCompare(b.time))
    )
  }, [])

  // Stats
  const total = reminders.length
  const done = reminders.filter(r => r.done).length
  const missed = reminders.filter(r => !r.done && getStatus(r.time) === 'missed').length

  // Sort: pending first (missed → soon → plenty), done at bottom
  const sorted = [...reminders].sort((a, b) => {
    const statusA = getStatus(a.time);
    const statusB = getStatus(b.time);

    // Prioritize missed, then soon, then plenty. Done always at bottom.
    const order = { 'missed': 1, 'soon': 2, 'plenty': 3, 'done': 4 };

    // Handle done items first
    if (a.done && !b.done) return 1; // b is not done, a is done -> a comes after b
    if (!a.done && b.done) return -1; // a is not done, b is done -> a comes before b
    if (a.done && b.done) return a.time.localeCompare(b.time); // If both are done, sort by time

    // For non-done items, sort by status priority, then by time
    if (order[statusA] !== order[statusB]) {
      return order[statusA] - order[statusB];
    }
    return a.time.localeCompare(b.time); // Both have same status priority, sort by time
  });

  // Render nothing on server side to avoid hydration issues until mounted on client
  if (!mounted) return null

  return (
    <>
      {/* Global styles injection */}
      <GlobalStyles />

      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #f3f4f6',
          padding: '100px 24px 32px',
        }}>
          <div className="page-header-row" style={{
            maxWidth: 800, margin: '0 auto',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 16,
          }}>
            <div className="fade-in">
              <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 400,
                color: '#111827', marginTop: 6, letterSpacing: -1,
              }}>
                Reminders
              </h1>
            </div>

            <button className="fade-d1" onClick={() => setShowModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 16,
              backgroundColor: '#111827', color: '#fff',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1f2937'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111827'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add Reminder
            </button>
          </div>

          {/* Mini Stats */}
          <div className="fade-d2" style={{
            maxWidth: 800, margin: '20px auto 0',
            display: 'flex', gap: 12,
          }}>
            {[
              { label: 'Total', value: total, bg: '#f3f4f6', color: '#374151' },
              { label: 'Done', value: done, bg: '#dcfce7', color: '#166534' },
              { label: 'Missed', value: missed, bg: missed > 0 ? '#fee2e2' : '#f3f4f6', color: missed > 0 ? '#991b1b' : '#6b7280' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '10px 18px', borderRadius: 12,
                backgroundColor: s.bg, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color, opacity: 0.7 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder List */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 120px' }}>

          {/* Legend */}
          <div className="fade-d2" style={{ marginBottom: 20 }}>
            <Legend />
          </div>

          {/* Cards */}
          {sorted.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sorted.map((r, i) => (
                <div key={r.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <ReminderCard
                    r={r}
                    onToggle={toggleDone}
                    onDelete={deleteReminder}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom count */}
          {sorted.length > 0 && (
            <p style={{
              textAlign: 'center', marginTop: 28,
              fontSize: 14, color: '#d1d5db', fontWeight: 500,
            }}>
              {done}/{total} completed
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdd={addReminder}
        />
      )}
    </>
  )
}