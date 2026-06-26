import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { sessionTypeColor } from '../../lib/colors'
import type { WeeklySession, SessionBriefing, Competency } from '../../lib/types'

const DAYS = ['','Monday','Tuesday','Wednesday','Thursday','Friday']

interface SectionDef {
  icon: string
  title: string
  key: keyof SessionBriefing
  type: 'text' | 'list' | 'conditions' | 'checklist' | 'redflags' | 'signoffs'
}

const SECTIONS: SectionDef[] = [
  { icon: '📋', title: 'Session Summary',          key: 'session_summary',        type: 'text' },
  { icon: '🎯', title: 'Curriculum Objectives',    key: 'curriculum_objectives',  type: 'list' },
  { icon: '🏥', title: 'Conditions to Expect',     key: 'conditions_to_expect',   type: 'conditions' },
  { icon: '✅', title: 'Clinical Checklist',       key: 'clinical_checklist',     type: 'checklist' },
  { icon: '🩺', title: 'Examination Prompts',      key: 'examination_prompts',    type: 'list' },
  { icon: '💬', title: 'Questions for Patient',    key: 'questions_for_patient',  type: 'list' },
  { icon: '❓', title: 'Questions for Doctor',     key: 'questions_for_doctor',   type: 'list' },
  { icon: '🔍', title: 'Things to Look Up Before', key: 'things_to_look_up',     type: 'list' },
  { icon: '🚨', title: 'Red Flags',               key: 'red_flags',              type: 'redflags' },
  { icon: '✍️', title: 'Reflection Prompts',      key: 'reflection_prompts',     type: 'list' },
  { icon: '🎯', title: 'Sign-Offs to Chase Today', key: 'sign_offs_to_chase',    type: 'signoffs' },
]

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<WeeklySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [timetableFile, setTimetableFile] = useState<{ base64: string; mediaType: string; name: string } | null>(null)
  const [timetableError, setTimetableError] = useState<string | null>(null)
  const timetableInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'brief' | 'full'>('brief')

  useEffect(() => {
    if (!user || !id) return
    supabase.from('weekly_sessions').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => { if (!data) { navigate('/placement'); return }; setSession(data as WeeklySession); setLoading(false) })
  }, [user, id, navigate])

  function toggle(key: string) {
    setExpanded(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  async function handleTimetableUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setTimetableError(null)

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      setTimetableError('Please upload an image (JPG, PNG) or PDF.')
      return
    }

    const base64 = await fileToBase64(file)
    setTimetableFile({ base64, mediaType: file.type, name: file.name })
  }

  async function generateBriefing() {
    if (!session || !profile) return
    setGenerating(true); setError(null)
    try {
      const { data: progressRows } = await supabase.from('user_competency_progress').select('competency_id').eq('user_id', user!.id).eq('status', 'signed_off')
      const doneIds = (progressRows ?? []).map((r: { competency_id: string }) => r.competency_id)
      const { data: allComps } = await supabase.from('competencies').select('id, code, name, category').eq('curriculum', profile.curriculum ?? 'UKMLA')
      const outstanding = ((allComps as Competency[]) ?? []).filter(c => !doneIds.includes(c.id))

      const { data: { session: authSess } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authSess?.access_token}` },
        body: JSON.stringify({
          session, profile, outstandingCompetencies: outstanding,
          timetableBase64: timetableFile?.base64,
          timetableMediaType: timetableFile?.mediaType,
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed')
      const { briefing } = await res.json()
      await supabase.from('weekly_sessions').update({ briefing_json: briefing }).eq('id', session.id)
      setSession(p => p ? { ...p, briefing_json: briefing } : p)
      setExpanded(new Set())
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setGenerating(false) }
  }

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" /></div></Layout>
  if (!session) return null

  const briefing = session.briefing_json
  const typeCol = sessionTypeColor(session.session_type)

  return (
    <Layout>
      <button onClick={() => navigate('/placement')}
        className="flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1B2B6B] mb-4">
        ‹ Back
      </button>

      {/* Session header */}
      <div className="card-premium overflow-hidden mb-4">
        <div className="h-1" style={{ background: typeCol.accent }} />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {session.session_type && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: typeCol.bg, color: typeCol.text, border: `1px solid ${typeCol.border}` }}>
                {session.session_type}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-[#1B2B6B]">{session.session_name ?? 'Session'}</h1>
          <p className="text-sm text-[#4A5568] mt-1">
            {DAYS[session.day_of_week]}{session.start_time && ` · ${session.start_time}`}
            {session.location && ` · ${session.location}`}
            {session.specialty && ` · ${session.specialty}`}
          </p>
          {session.notes && <p className="text-sm text-[#4A5568] mt-2">{session.notes}</p>}
        </div>
      </div>

      {/* Timetable upload */}
      <div className="card-premium p-4 mb-4">
        <p className="text-sm font-medium text-[#4A5568] mb-2">
          Upload today's timetable or rota <span className="text-slate-500 font-normal">(optional)</span>
        </p>
        {timetableFile ? (
          <div className="flex items-center justify-between bg-[#EEF2FF] rounded px-3 py-2.5">
            <span className="text-sm text-[#1B2B6B] truncate">📎 {timetableFile.name}</span>
            <button onClick={() => setTimetableFile(null)} className="text-slate-500 hover:text-[#1B2B6B] text-sm ml-2 flex-shrink-0">✕</button>
          </div>
        ) : (
          <button onClick={() => timetableInputRef.current?.click()} className="w-full btn-ghost text-sm">
            📎 Upload PDF or photo
          </button>
        )}
        <input ref={timetableInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleTimetableUpload} />
        {timetableError && <p className="text-xs text-red-600 mt-2">{timetableError}</p>}
      </div>

      {!briefing ? (
        <div className="card-premium p-6 text-center mb-4">
          {!generating ? (
            <>
              {/* Teaser cards */}
              <div className="space-y-2 mb-5">
                {['Clinical Checklist','Red Flags','Questions for Doctor'].map(s => (
                  <div key={s} className="flex items-center gap-3 p-3 rounded bg-[#EEF2FF] blur-[1.5px] opacity-60">
                    <div className="w-8 h-8 rounded bg-[#E2E8F0] flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-[#E2E8F0] rounded w-1/3" />
                      <div className="h-2 bg-[#E2E8F0] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={generateBriefing} className="btn-teal w-full">
                ✨ Get Prepped
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full teal-pulse flex items-center justify-center"
                style={{ background: 'rgba(27,43,107,0.08)', border: '2px solid #1B2B6B' }}>
                <div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-[#1B2B6B]">Generating your briefing…</p>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {/* Brief / Full toggle */}
          <div className="flex gap-1 p-1 bg-[#EEF2FF] rounded w-fit mb-1">
            {(['brief', 'full'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors capitalize ${
                  mode === m ? 'bg-[#1B2B6B] text-white' : 'text-[#1B2B6B] border border-[#1B2B6B]/30 hover:bg-white'
                }`}>
                {m}
              </button>
            ))}
          </div>

          {mode === 'brief' && (
            <>
              {briefing.brief_summary?.length > 0 && (
                <div className="card-premium p-4">
                  <p className="text-sm font-semibold text-[#1B2B6B] mb-2">📋 At a Glance</p>
                  <ul className="space-y-1.5">
                    {briefing.brief_summary.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#4A5568]"><span className="text-[#1B2B6B] flex-shrink-0">•</span>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
              {briefing.sign_offs_to_chase?.length > 0 && (
                <div className="card-premium p-4">
                  <p className="text-sm font-semibold text-[#1B2B6B] mb-2">🎯 Sign-Offs to Chase Today</p>
                  <div className="space-y-2">
                    {briefing.sign_offs_to_chase.map((s, i) => (
                      <div key={i} className="bg-[#EEF2FF] rounded px-3 py-2.5">
                        <p className="text-sm font-semibold text-[#1B2B6B]">{s.opportunity}</p>
                        <p className="text-xs text-[#4A5568] mt-0.5">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {briefing.red_flags?.length > 0 && (
                <div className="card-premium p-4">
                  <p className="text-sm font-semibold text-[#1B2B6B] mb-2">🚨 Red Flags</p>
                  <ul className="space-y-1.5">
                    {briefing.red_flags.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#4A5568]"><span className="flex-shrink-0">🚨</span>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {mode === 'full' && SECTIONS.map(sec => {
            const content = briefing[sec.key]
            if (!content || (Array.isArray(content) && content.length === 0)) return null
            const isOpen = expanded.has(sec.key as string)

            return (
              <div key={sec.key} className="card-premium overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#EEF2FF] transition-colors"
                  onClick={() => toggle(sec.key as string)}>
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-[#1B2B6B]">
                    <span>{sec.icon}</span>{sec.title}
                  </span>
                  <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden min-h-0">
                  <div className="px-4 pb-4 border-t border-[#E2E8F0]">
                    {sec.type === 'text' && (
                      <p className="text-sm text-[#4A5568] mt-3 leading-relaxed">{content as string}</p>
                    )}
                    {sec.type === 'list' && (
                      <ul className="mt-3 space-y-2">
                        {(content as string[]).map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-[#4A5568]">
                            <span className="text-[#1B2B6B] flex-shrink-0 mt-0.5">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {sec.type === 'checklist' && (
                      <ul className="mt-3 space-y-2">
                        {(content as string[]).map((item, i) => {
                          const key = `${sec.key}-${i}`
                          return (
                            <li key={i} className="flex gap-2.5 text-sm cursor-pointer"
                              onClick={() => setChecked(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })}>
                              <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${checked.has(key) ? 'bg-[#1B2B6B] border-[#1B2B6B]' : 'border-[#E2E8F0]'}`}>
                                {checked.has(key) && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className={checked.has(key) ? 'text-slate-500 line-through' : 'text-[#4A5568]'}>{item}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    {sec.type === 'conditions' && (
                      <div className="mt-3 space-y-2">
                        {(content as { name: string; key_points: string }[]).map((c, i) => (
                          <div key={i} className="bg-[#EEF2FF] rounded px-3 py-2.5">
                            <p className="text-sm font-semibold text-[#4A5568]">{c.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{c.key_points}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {sec.type === 'redflags' && (
                      <ul className="mt-3 space-y-2">
                        {(content as string[]).map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm">
                            <span className="flex-shrink-0">🚨</span>
                            <span className="text-[#4A5568]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {sec.type === 'signoffs' && (
                      <div className="mt-3 space-y-2">
                        {(content as { opportunity: string; reason: string }[]).map((s, i) => (
                          <div key={i} className="bg-[#EEF2FF] rounded px-3 py-2.5">
                            <p className="text-sm font-semibold text-[#1B2B6B]">{s.opportunity}</p>
                            <p className="text-xs text-[#4A5568] mt-0.5">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            )
          })}

          <button onClick={generateBriefing} disabled={generating}
            className="w-full btn-ghost text-sm mt-2">↻ Regenerate briefing</button>
        </div>
      )}

      {/* Log this session CTA */}
      <Link to={`/logs/new?specialty=${encodeURIComponent(session.specialty ?? '')}`}
        className="card-premium p-4 flex items-center gap-3 hover:bg-[#EEF2FF] transition-colors">
        <div className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(27,43,107,0.08)', border: '1px solid rgba(27,43,107,0.25)' }}>🩺</div>
        <div>
          <p className="text-sm font-semibold text-[#1B2B6B]">Log this session</p>
          <p className="text-xs text-slate-500 mt-0.5">Add a clinical log for today's placement</p>
        </div>
        <span className="ml-auto text-slate-500">›</span>
      </Link>
    </Layout>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
