import { useEffect, useState } from 'react'
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
  type: 'text' | 'list' | 'conditions' | 'checklist' | 'redflags'
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
]

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<WeeklySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['session_summary','curriculum_objectives']))
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user || !id) return
    supabase.from('weekly_sessions').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(({ data }) => { if (!data) { navigate('/placement'); return }; setSession(data as WeeklySession); setLoading(false) })
  }, [user, id, navigate])

  function toggle(key: string) {
    setExpanded(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })
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
        body: JSON.stringify({ session, profile, outstandingCompetencies: outstanding }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed')
      const { briefing } = await res.json()
      await supabase.from('weekly_sessions').update({ briefing_json: briefing }).eq('id', session.id)
      setSession(p => p ? { ...p, briefing_json: briefing } : p)
      setExpanded(new Set(SECTIONS.map(s => s.key as string)))
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setGenerating(false) }
  }

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /></div></Layout>
  if (!session) return null

  const briefing = session.briefing_json
  const typeCol = sessionTypeColor(session.session_type)

  return (
    <Layout>
      <button onClick={() => navigate('/placement')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4">
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
          <h1 className="text-lg font-bold text-slate-100">{session.session_name ?? 'Session'}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {DAYS[session.day_of_week]} · {session.time_slot.charAt(0).toUpperCase() + session.time_slot.slice(1)}
            {session.location && ` · ${session.location}`}
            {session.specialty && ` · ${session.specialty}`}
          </p>
          {session.notes && <p className="text-sm text-slate-400 mt-2">{session.notes}</p>}
        </div>
      </div>

      {!briefing ? (
        <div className="card-premium p-6 text-center mb-4">
          {!generating ? (
            <>
              {/* Teaser cards */}
              <div className="space-y-2 mb-5">
                {['Clinical Checklist','Red Flags','Questions for Doctor'].map(s => (
                  <div key={s} className="flex items-center gap-3 p-3 rounded-xl bg-[#162035] blur-[1.5px] opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-[#1E2D45] flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-[#1E2D45] rounded w-1/3" />
                      <div className="h-2 bg-[#1E2D45] rounded w-2/3" />
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
                style={{ background: 'rgba(20,184,166,0.12)', border: '2px solid #14B8A6' }}>
                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Generating your briefing…</p>
                <p className="text-sm text-slate-500 mt-1">Claude is preparing all 10 sections</p>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {SECTIONS.map(sec => {
            const content = briefing[sec.key]
            if (!content || (Array.isArray(content) && content.length === 0)) return null
            const isOpen = expanded.has(sec.key as string)

            return (
              <div key={sec.key} className="card-premium overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#162035] transition-colors"
                  onClick={() => toggle(sec.key as string)}>
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
                    <span>{sec.icon}</span>{sec.title}
                  </span>
                  <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-[#1E2D45]">
                    {sec.type === 'text' && (
                      <p className="text-sm text-slate-400 mt-3 leading-relaxed">{content as string}</p>
                    )}
                    {sec.type === 'list' && (
                      <ul className="mt-3 space-y-2">
                        {(content as string[]).map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-slate-400">
                            <span className="text-teal-500 flex-shrink-0 mt-0.5">•</span>{item}
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
                              <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${checked.has(key) ? 'bg-teal-500 border-teal-500' : 'border-[#1E2D45]'}`}>
                                {checked.has(key) && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className={checked.has(key) ? 'text-slate-600 line-through' : 'text-slate-400'}>{item}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    {sec.type === 'conditions' && (
                      <div className="mt-3 space-y-2">
                        {(content as { name: string; key_points: string }[]).map((c, i) => (
                          <div key={i} className="bg-[#162035] rounded-xl px-3 py-2.5">
                            <p className="text-sm font-semibold text-slate-300">{c.name}</p>
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
                            <span className="text-slate-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={generateBriefing} disabled={generating}
            className="w-full btn-ghost text-sm mt-2">↻ Regenerate briefing</button>
        </div>
      )}

      {/* Log this session CTA */}
      <Link to={`/logs/new?specialty=${encodeURIComponent(session.specialty ?? '')}`}
        className="card-premium p-4 flex items-center gap-3 hover:bg-[#162035] transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)' }}>🩺</div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Log this session</p>
          <p className="text-xs text-slate-500 mt-0.5">Add a clinical log for today's placement</p>
        </div>
        <span className="ml-auto text-slate-600">›</span>
      </Link>
    </Layout>
  )
}
