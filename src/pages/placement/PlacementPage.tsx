import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import type { WeeklySession, SessionType } from '../../lib/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = ['morning', 'afternoon'] as const

const SESSION_TYPES: SessionType[] = ['Ward Round', 'Theatre', 'Clinic', 'Lecture', 'Tutorial', 'Other']

const TYPE_COLORS: Record<string, string> = {
  'Ward Round': 'bg-blue-50 border-blue-300 text-blue-900',
  'Theatre':    'bg-purple-50 border-purple-300 text-purple-900',
  'Clinic':     'bg-[#EEF2FF] border-[#1B2B6B]/40 text-[#1B2B6B]',
  'Lecture':    'bg-amber-50 border-amber-300 text-amber-900',
  'Tutorial':   'bg-green-50 border-green-300 text-green-900',
  'Other':      'bg-gray-50 border-gray-300 text-gray-900',
}

const TYPE_BADGE: Record<string, string> = {
  'Ward Round': 'bg-blue-100 text-blue-700',
  'Theatre':    'bg-purple-100 text-purple-700',
  'Clinic':     'bg-[#E0E7FF] text-[#1B2B6B]',
  'Lecture':    'bg-amber-100 text-amber-700',
  'Tutorial':   'bg-green-100 text-green-700',
  'Other':      'bg-gray-100 text-gray-700',
}

const SPECIALTIES = [
  'General Medicine', 'Surgery', 'Paediatrics', 'Psychiatry', 'General Practice',
  'Emergency Medicine', 'Obstetrics & Gynaecology', 'Anaesthetics', 'Radiology',
  'Cardiology', 'Neurology', 'Orthopaedics', 'Oncology', 'Dermatology', 'ENT',
]

function getMondayOf(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeek(monday: Date) {
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function PlacementPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()))
  const [sessions, setSessions] = useState<WeeklySession[]>([])
  const [loading, setLoading] = useState(true)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Add session modal
  const [addModal, setAddModal] = useState<{ day: number; slot: 'morning' | 'afternoon' } | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<SessionType>('Ward Round')
  const [formSpecialty, setFormSpecialty] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('weekly_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', toISODate(weekStart))
      .then(({ data }) => {
        setSessions((data as WeeklySession[]) ?? [])
        setLoading(false)
      })
  }, [user, weekStart])

  function getSession(day: number, slot: 'morning' | 'afternoon') {
    return sessions.find(s => s.day_of_week === day && s.time_slot === slot) ?? null
  }

  function changeWeek(dir: number) {
    setWeekStart(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + dir * 7)
      return d
    })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    e.target.value = ''
    setParsing(true)
    setParseError(null)

    try {
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      if (!isImage && !isPdf) {
        setParseError('Please upload an image (JPG, PNG) or PDF.')
        setParsing(false)
        return
      }

      // Convert to base64
      const base64 = await fileToBase64(file)
      // For PDFs, we send as application/pdf; for images, use the image type
      const mediaType = isPdf ? 'application/pdf' : file.type

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-timetable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64,
            mediaType,
            weekStart: toISODate(weekStart),
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const { sessions: parsed } = await res.json()
      if (!parsed || parsed.length === 0) {
        setParseError("Couldn't read a timetable from that image. Try a clearer photo or add sessions manually.")
        setParsing(false)
        return
      }

      // Insert parsed sessions (skip slots already filled)
      const toInsert = parsed
        .filter((s: { day_of_week: number; time_slot: string }) =>
          !sessions.find(ex => ex.day_of_week === s.day_of_week && ex.time_slot === s.time_slot)
        )
        .map((s: Record<string, unknown>) => ({
          ...s,
          user_id: user.id,
          week_start: toISODate(weekStart),
        }))

      if (toInsert.length > 0) {
        const { data } = await supabase.from('weekly_sessions').insert(toInsert).select()
        setSessions(prev => [...prev, ...((data as WeeklySession[]) ?? [])])
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setParsing(false)
    }
  }

  function openAddModal(day: number, slot: 'morning' | 'afternoon') {
    setAddModal({ day, slot })
    setFormName(''); setFormType('Ward Round'); setFormSpecialty(''); setFormLocation(''); setFormNotes('')
  }

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !addModal) return
    setSaving(true)
    const { data } = await supabase.from('weekly_sessions').insert({
      user_id: user.id,
      week_start: toISODate(weekStart),
      day_of_week: addModal.day,
      time_slot: addModal.slot,
      session_name: formName || null,
      session_type: formType,
      specialty: formSpecialty || null,
      location: formLocation || null,
      notes: formNotes || null,
    }).select().single()
    setSaving(false)
    if (data) setSessions(prev => [...prev, data as WeeklySession])
    setAddModal(null)
  }

  async function deleteSession(id: string) {
    await supabase.from('weekly_sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1B2B6B]">Help on Placement</h1>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#1B2B6B] hover:bg-[#EEF2FF] disabled:opacity-50 text-[#1B2B6B] text-sm font-semibold rounded transition-colors"
        >
          {parsing ? (
            <>
              <span className="w-4 h-4 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
              Reading timetable…
            </>
          ) : (
            <>📎 Upload timetable</>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
      </div>

      {parseError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-3">
          {parseError}
          <button onClick={() => setParseError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Week navigator */}
      <div className="flex items-center justify-between mb-4 bg-white rounded border border-[#E2E8F0] px-4 py-3">
        <button onClick={() => changeWeek(-1)} className="text-slate-500 hover:text-[#1B2B6B] text-lg px-2">‹</button>
        <div className="text-center">
          <p className="font-semibold text-[#1B2B6B] text-sm">Week of {formatWeek(weekStart)}</p>
        </div>
        <button onClick={() => changeWeek(1)} className="text-slate-500 hover:text-[#1B2B6B] text-lg px-2">›</button>
      </div>

      {/* Timetable grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {DAYS.map((dayName, idx) => {
            const dayNum = idx + 1
            return (
              <div key={dayName}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{dayName}</p>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map(slot => {
                    const sess = getSession(dayNum, slot)
                    if (sess) {
                      return (
                        <SessionCard
                          key={slot}
                          session={sess}
                          onOpen={() => navigate(`/placement/session/${sess.id}`)}
                          onDelete={() => deleteSession(sess.id)}
                        />
                      )
                    }
                    return (
                      <button
                        key={slot}
                        onClick={() => openAddModal(dayNum, slot)}
                        className="h-16 rounded border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center text-slate-400 hover:border-[#1B2B6B]/40 hover:text-[#4A5568] transition-colors"
                      >
                        <span className="text-xl leading-none">+</span>
                        <span className="text-xs mt-0.5 capitalize">{slot}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add session modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4">
          <div className="bg-white rounded w-full max-w-sm p-5 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1B2B6B]">
                Add session — {DAYS[addModal.day - 1]} {addModal.slot}
              </h2>
              <button onClick={() => setAddModal(null)} className="text-slate-500 hover:text-[#1B2B6B]">✕</button>
            </div>
            <form onSubmit={handleAddSession} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1">Session name</label>
                <input
                  type="text" required value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Acute Medical Ward Round"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-1">Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value as SessionType)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30">
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-1">Specialty</label>
                  <select value={formSpecialty} onChange={e => setFormSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30">
                    <option value="">Select…</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1">Location <span className="text-slate-500 font-normal">(optional)</span></label>
                <input type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)}
                  placeholder="e.g. Ward 4B, Outpatients B"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1">Notes <span className="text-slate-500 font-normal">(optional)</span></label>
                <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)}
                  placeholder="Any extra context"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-white border border-[#1B2B6B] hover:bg-[#EEF2FF] disabled:opacity-50 text-[#1B2B6B] font-semibold rounded transition-colors text-sm mt-1">
                {saving ? 'Adding…' : 'Add session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

function SessionCard({ session, onOpen, onDelete }: {
  session: WeeklySession
  onOpen: () => void
  onDelete: () => void
}) {
  const colorClass = TYPE_COLORS[session.session_type ?? 'Other'] ?? TYPE_COLORS['Other']
  const badgeClass = TYPE_BADGE[session.session_type ?? 'Other'] ?? TYPE_BADGE['Other']
  const hasBriefing = !!session.briefing_json

  return (
    <div className={`relative rounded border-l-4 p-3 cursor-pointer hover:opacity-90 transition-opacity ${colorClass}`}
      onClick={onOpen}>
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{session.session_name ?? 'Session'}</p>
          {session.session_type && (
            <span className={`inline-block text-xs rounded px-1.5 py-0.5 mt-1 font-medium ${badgeClass}`}>
              {session.session_type}
            </span>
          )}
          {session.location && (
            <p className="text-xs opacity-60 mt-0.5 truncate">{session.location}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {hasBriefing && <span className="text-xs" title="Briefing ready">✓</span>}
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="text-xs opacity-40 hover:opacity-80"
          >✕</button>
        </div>
      </div>
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data:...;base64, prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
