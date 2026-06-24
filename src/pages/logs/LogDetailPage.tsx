import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { specialtyColor, formatDate } from '../../lib/colors'
import type { ClinicalLog, Reflection, Competency } from '../../lib/types'

const GIBBS = ['Description','Feelings','Evaluation','Analysis','Conclusion','Action Plan']

export function LogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [log, setLog] = useState<ClinicalLog & { competencies: Competency[] } | null>(null)
  const [reflection, setReflection] = useState<Reflection | null>(null)
  const [reflText, setReflText] = useState('')
  const [reflSections, setReflSections] = useState<Record<string,string>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [framework, setFramework] = useState<'STARR'|'Gibbs'>('Gibbs')
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (!user || !id) return
    Promise.all([
      supabase.from('clinical_logs').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('clinical_log_competencies').select('competency_id, competencies(*)').eq('log_id', id),
      supabase.from('reflections').select('*').eq('log_id', id).eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]).then(([logRes, compRes, refRes]) => {
      if (!logRes.data) { navigate('/logs'); return }
      const competencies = (compRes.data ?? []).map((r: { competencies: Competency | Competency[] }) =>
        Array.isArray(r.competencies) ? r.competencies[0] : r.competencies).filter(Boolean) as Competency[]
      setLog({ ...(logRes.data as ClinicalLog), competencies })
      if (refRes.data) {
        const ref = refRes.data as Reflection
        setReflection(ref)
        const text = ref.final_text ?? ref.raw_ai_output ?? ''
        setReflText(text)
        parseSections(text)
        setExpandedSections(new Set(GIBBS.slice(0,2)))
      }
      setLoading(false)
    })
  }, [user, id, navigate])

  function parseSections(text: string) {
    const secs: Record<string,string> = {}
    GIBBS.forEach(sec => {
      const re = new RegExp(`\\*\\*${sec}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i')
      const m = text.match(re)
      if (m) secs[sec] = m[1].trim()
    })
    setReflSections(secs)
  }

  async function generateReflection() {
    if (!log) return
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ log, framework }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const { reflection: text } = await res.json()
      setReflText(text); parseSections(text)
      setExpandedSections(new Set(GIBBS))
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setGenerating(false) }
  }

  async function saveReflection() {
    if (!user || !id) return
    setSaving(true)
    const final = reflText
    const { data, error: err } = reflection
      ? await supabase.from('reflections').update({ final_text: final, approved_at: new Date().toISOString() }).eq('id', reflection.id).select().single()
      : await supabase.from('reflections').insert({ log_id: id, user_id: user.id, framework, raw_ai_output: final, final_text: final, approved_at: new Date().toISOString() }).select().single()
    setSaving(false)
    if (err) setError(err.message)
    else { setReflection(data as Reflection); setError(null) }
  }

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" /></div></Layout>
  if (!log) return null

  const col = specialtyColor(log.specialty)

  return (
    <Layout>
      {/* Back */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/logs')}
          className="w-8 h-8 rounded bg-white border border-[#E2E8F0] flex items-center justify-center text-[#4A5568] hover:text-[#1B2B6B]">‹</button>
        <h1 className="text-lg font-bold text-[#1B2B6B] flex-1 truncate">{log.presentation || 'Clinical log'}</h1>
        <button onClick={async () => {
          if (!confirm('Delete this log?')) return
          await supabase.from('reflections').delete().eq('log_id', id!)
          await supabase.from('clinical_log_competencies').delete().eq('log_id', id!)
          await supabase.from('clinical_logs').delete().eq('id', id!)
          navigate('/logs')
        }} className="text-xs text-red-600 hover:text-red-700">Delete</button>
      </div>

      {/* Log card */}
      <div className="card-premium overflow-hidden mb-4">
        <div className="h-1 w-full" style={{ background: col.accent }} />
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {log.specialty && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: col.bg, color: col.text }}>{log.specialty}</span>}
            {log.case_type && <span className="text-xs px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4A5568]">{log.case_type}</span>}
            {log.role && <span className="text-xs px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4A5568]">{log.role}</span>}
            <div className={`ml-auto flex items-center gap-1.5 text-xs ${log.status === 'complete' ? 'text-emerald-700' : 'text-amber-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {log.status === 'complete' ? 'Complete' : 'Draft'}
            </div>
          </div>

          <div className="flex gap-4 text-xs text-[#4A5568]">
            <span>📅 {formatDate(log.encounter_date)}</span>
            {log.supervisor && <span>👤 {log.supervisor}</span>}
          </div>

          {log.presentation && (
            <div>
              <p className="text-xs text-[#4A5568] mb-1">Description</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{log.presentation}</p>
            </div>
          )}

          {(log.procedures_observed?.length > 0 || log.procedures_performed?.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {log.procedures_observed?.length > 0 && (
                <div>
                  <p className="text-xs text-[#4A5568] mb-1">Observed</p>
                  <ul className="space-y-0.5">{log.procedures_observed.map((p,i) => <li key={i} className="text-xs text-[#4A5568]">· {p}</li>)}</ul>
                </div>
              )}
              {log.procedures_performed?.length > 0 && (
                <div>
                  <p className="text-xs text-[#4A5568] mb-1">Performed</p>
                  <ul className="space-y-0.5">{log.procedures_performed.map((p,i) => <li key={i} className="text-xs text-[#4A5568]">· {p}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {log.competencies.length > 0 && (
            <div>
              <p className="text-xs text-[#4A5568] mb-1.5">Competencies</p>
              <div className="flex flex-wrap gap-1.5">
                {log.competencies.map(c => (
                  <span key={c.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: col.bg, color: col.text }}>
                    {c.code && <span className="opacity-50 mr-1">{c.code}</span>}{c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reflection */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1B2B6B]">Reflection</h2>
          {reflection?.approved_at && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">Saved</span>}
        </div>

        <div className="flex gap-2 mb-4">
          {(['Gibbs','STARR'] as const).map(f => (
            <button key={f} onClick={() => setFramework(f)}
              className={framework === f ? 'pill-selected text-xs' : 'pill-default text-xs'}>{f}</button>
          ))}
        </div>

        {!reflText && !generating ? (
          <button onClick={generateReflection} className="btn-teal w-full">
            ✨ Generate {framework} reflection
          </button>
        ) : generating ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full teal-pulse flex items-center justify-center"
              style={{ background: 'rgba(27,43,107,0.08)', border: '2px solid #1B2B6B' }}>
              <div className="w-4 h-4 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-[#4A5568]">Generating {framework} reflection…</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(Object.keys(reflSections).length > 0 ? Object.entries(reflSections) : [['Full text', reflText]]).map(([sec, content]) => {
              const isOpen = expandedSections.has(sec)
              return (
                <div key={sec} className="bg-[#EEF2FF] rounded overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#E0E7FF] transition-colors"
                    onClick={() => setExpandedSections(p => { const n = new Set(p); n.has(sec) ? n.delete(sec) : n.add(sec); return n })}>
                    <span className="text-sm font-medium text-[#4A5568]">{sec}</span>
                    <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 border-t border-[#E2E8F0]">
                      <textarea rows={4} value={content}
                        onChange={e => {
                          if (sec === 'Full text') setReflText(e.target.value)
                          else setReflSections(p => ({ ...p, [sec]: e.target.value }))
                        }}
                        className="w-full mt-2.5 px-3 py-2 bg-white border border-[#E2E8F0] rounded text-sm text-[#4A5568] focus:outline-none focus:border-[#1B2B6B] resize-none" />
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex gap-2 mt-3">
              <button onClick={generateReflection} disabled={generating}
                className="flex-1 btn-ghost text-sm py-2">↻ Regenerate</button>
              <button onClick={saveReflection} disabled={saving}
                className="flex-1 btn-teal text-sm py-2">{saving ? '…' : 'Save reflection'}</button>
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Log this session CTA if came from placement */}
      <div className="mt-4 text-center">
        <Link to="/logs/new" className="text-xs text-[#1B2B6B] hover:underline">+ Log another case</Link>
      </div>
    </Layout>
  )
}
