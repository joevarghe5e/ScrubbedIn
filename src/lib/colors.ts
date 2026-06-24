// Specialty accent colors — used for left bars, dots, tags
export const SPECIALTY_COLORS: Record<string, { accent: string; bg: string; text: string }> = {
  'General Medicine':       { accent: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  text: '#1D4ED8' },
  'Surgery':                { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  text: '#6D28D9' },
  'Paediatrics':            { accent: '#EC4899', bg: 'rgba(236,72,153,0.10)',  text: '#BE185D' },
  'Psychiatry':             { accent: '#6366F1', bg: 'rgba(99,102,241,0.10)',  text: '#4338CA' },
  'General Practice':       { accent: '#14B8A6', bg: 'rgba(20,184,166,0.10)',  text: '#0F766E' },
  'Emergency Medicine':     { accent: '#EF4444', bg: 'rgba(239,68,68,0.10)',   text: '#B91C1C' },
  'Obstetrics & Gynaecology':{ accent: '#F43F5E', bg: 'rgba(244,63,94,0.10)',  text: '#BE123C' },
  'Anaesthetics':           { accent: '#06B6D4', bg: 'rgba(6,182,212,0.10)',   text: '#0E7490' },
  'Radiology':              { accent: '#64748B', bg: 'rgba(100,116,139,0.10)', text: '#334155' },
  'Cardiology':             { accent: '#F43F5E', bg: 'rgba(244,63,94,0.10)',   text: '#BE123C' },
  'Neurology':              { accent: '#7C3AED', bg: 'rgba(124,58,237,0.10)',  text: '#5B21B6' },
  'Orthopaedics':           { accent: '#F97316', bg: 'rgba(249,115,22,0.10)',  text: '#C2410C' },
  'Oncology':               { accent: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  text: '#B45309' },
  'Dermatology':            { accent: '#EAB308', bg: 'rgba(234,179,8,0.10)',   text: '#A16207' },
  'ENT':                    { accent: '#84CC16', bg: 'rgba(132,204,22,0.10)',   text: '#4D7C0F' },
}

export function specialtyColor(specialty: string | null) {
  return SPECIALTY_COLORS[specialty ?? ''] ?? { accent: '#475569', bg: 'rgba(71,85,105,0.10)', text: '#334155' }
}

// Session type colors
export const SESSION_TYPE_COLORS: Record<string, { accent: string; bg: string; text: string; border: string }> = {
  'Ward Round': { accent: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  text: '#1D4ED8', border: 'rgba(59,130,246,0.3)' },
  'Theatre':    { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  text: '#6D28D9', border: 'rgba(139,92,246,0.3)' },
  'Clinic':     { accent: '#14B8A6', bg: 'rgba(20,184,166,0.10)',  text: '#0F766E', border: 'rgba(20,184,166,0.3)' },
  'Lecture':    { accent: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  text: '#B45309', border: 'rgba(245,158,11,0.3)' },
  'Tutorial':   { accent: '#22C55E', bg: 'rgba(34,197,94,0.10)',   text: '#15803D', border: 'rgba(34,197,94,0.3)' },
  'On-call':    { accent: '#EF4444', bg: 'rgba(239,68,68,0.10)',   text: '#B91C1C', border: 'rgba(239,68,68,0.3)' },
  'Other':      { accent: '#64748B', bg: 'rgba(100,116,139,0.10)', text: '#334155', border: 'rgba(100,116,139,0.3)' },
}

export function sessionTypeColor(type: string | null) {
  return SESSION_TYPE_COLORS[type ?? ''] ?? SESSION_TYPE_COLORS['Other']
}

// Role colors
export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  'Observer':          { bg: 'rgba(100,116,139,0.10)', text: '#334155' },
  'Assisted':          { bg: 'rgba(245,158,11,0.10)',  text: '#B45309' },
  'Led independently': { bg: 'rgba(20,184,166,0.10)',  text: '#0F766E' },
  'Primary':           { bg: 'rgba(59,130,246,0.10)',  text: '#1D4ED8' },
}

// Format date: "26 Mar 2026"
export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
