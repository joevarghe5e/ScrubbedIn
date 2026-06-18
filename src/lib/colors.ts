// Specialty accent colors — used for left bars, dots, tags
export const SPECIALTY_COLORS: Record<string, { accent: string; bg: string; text: string }> = {
  'General Medicine':       { accent: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD' },
  'Surgery':                { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  text: '#C4B5FD' },
  'Paediatrics':            { accent: '#EC4899', bg: 'rgba(236,72,153,0.12)',  text: '#F9A8D4' },
  'Psychiatry':             { accent: '#6366F1', bg: 'rgba(99,102,241,0.12)',  text: '#A5B4FC' },
  'General Practice':       { accent: '#14B8A6', bg: 'rgba(20,184,166,0.12)',  text: '#5EEAD4' },
  'Emergency Medicine':     { accent: '#EF4444', bg: 'rgba(239,68,68,0.12)',   text: '#FCA5A5' },
  'Obstetrics & Gynaecology':{ accent: '#F43F5E', bg: 'rgba(244,63,94,0.12)',  text: '#FDA4AF' },
  'Anaesthetics':           { accent: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   text: '#67E8F9' },
  'Radiology':              { accent: '#64748B', bg: 'rgba(100,116,139,0.12)', text: '#CBD5E1' },
  'Cardiology':             { accent: '#F43F5E', bg: 'rgba(244,63,94,0.12)',   text: '#FDA4AF' },
  'Neurology':              { accent: '#7C3AED', bg: 'rgba(124,58,237,0.12)',  text: '#C4B5FD' },
  'Orthopaedics':           { accent: '#F97316', bg: 'rgba(249,115,22,0.12)',  text: '#FDBA74' },
  'Oncology':               { accent: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D' },
  'Dermatology':            { accent: '#EAB308', bg: 'rgba(234,179,8,0.12)',   text: '#FDE047' },
  'ENT':                    { accent: '#84CC16', bg: 'rgba(132,204,22,0.12)',   text: '#BEF264' },
}

export function specialtyColor(specialty: string | null) {
  return SPECIALTY_COLORS[specialty ?? ''] ?? { accent: '#475569', bg: 'rgba(71,85,105,0.12)', text: '#94A3B8' }
}

// Session type colors
export const SESSION_TYPE_COLORS: Record<string, { accent: string; bg: string; text: string; border: string }> = {
  'Ward Round': { accent: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  text: '#93C5FD', border: 'rgba(59,130,246,0.4)' },
  'Theatre':    { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.15)',  text: '#C4B5FD', border: 'rgba(139,92,246,0.4)' },
  'Clinic':     { accent: '#14B8A6', bg: 'rgba(20,184,166,0.15)',  text: '#5EEAD4', border: 'rgba(20,184,166,0.4)' },
  'Lecture':    { accent: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  text: '#FCD34D', border: 'rgba(245,158,11,0.4)' },
  'Tutorial':   { accent: '#22C55E', bg: 'rgba(34,197,94,0.15)',   text: '#86EFAC', border: 'rgba(34,197,94,0.4)' },
  'On-call':    { accent: '#EF4444', bg: 'rgba(239,68,68,0.15)',   text: '#FCA5A5', border: 'rgba(239,68,68,0.4)' },
  'Other':      { accent: '#64748B', bg: 'rgba(100,116,139,0.15)', text: '#CBD5E1', border: 'rgba(100,116,139,0.4)' },
}

export function sessionTypeColor(type: string | null) {
  return SESSION_TYPE_COLORS[type ?? ''] ?? SESSION_TYPE_COLORS['Other']
}

// Role colors
export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  'Observer':          { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
  'Assisted':          { bg: 'rgba(245,158,11,0.15)',  text: '#FCD34D' },
  'Led independently': { bg: 'rgba(20,184,166,0.15)',  text: '#5EEAD4' },
  'Primary':           { bg: 'rgba(59,130,246,0.15)',  text: '#93C5FD' },
}

// Format date: "26 Mar 2026"
export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
