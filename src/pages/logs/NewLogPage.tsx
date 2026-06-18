import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import type { Competency } from '../../lib/types'

const SPECIALTIES = ['General Medicine','Surgery','Paediatrics','Psychiatry','General Practice','Emergency Medicine','Obstetrics & Gynaecology','Anaesthetics','Radiology','Cardiology','Neurology','Orthopaedics','Oncology','Dermatology','ENT']
const CASE_TYPES = ['Emergency','Elective','Clinic','Ward','Theatre','Other']
const ROLES = ['Observer','Assisted','Led independently','Primary']
const REFLECTION_SECTIONS = ['Description','Feelings','Evaluation','Analysis','Conclusion','Action Plan']

interface FormData {
  encounterDate: string
  specialty: string
  caseType: string
  role: string
  supervisor: string
  presentation: string
  proceduresObserved: string
  proceduresPerformed: string
  learningPoints: string
  selectedCompetencies: string[]
}

export function NewLogPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reflection, setReflection] = useState('')
  const [reflectionSections, setReflectionSections] = useState<Record<string, string>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Description']))
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    encounterDate: new Date().toISOString().slice(0,10),
    specialty: '', caseType: '', role: '', supervisor: '',
    presentation: '', proceduresObserved: '', proceduresPerformed: '',
    learningPoints: '', selectedCompetencies: [],
  })

  useEffect(() => {
    const curriculum = profile?.curriculum ?? 'UKMLA'
    supabase.from('competencies').select('*').eq('curriculum', curriculum).order('category')
      .then(({ data }) => setCompetencies((data as Competency[]) ?? []))
  }, [profile])

  function set(k: keyof FormData, v: string | string[]) { setForm(f => ({ ...f, [k]: v })) }
  function toggleComp(id: string) { set('selectedCompetencies', form.selectedCompetencies.includes(id) ? form.selectedCompetencies.filter(x => x !== id) : [...form.selectedCompetencies, id]) }

  async function generateReflection() {
    if (!form.presentation.trim()) return
    setGenerating(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const log = {
        specialty: form.specialty, presentation: form.presentation,
        procedures_observed: form.proceduresObserved.split('\n').filter(Boolean),
        procedures_performed: form.proceduresPerformed.split('\n').filter(Boolean),
        learning_points: form.learningPoints, encounter_date: form.encounterDate,
      }
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ log, framework: 'Gibbs' }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const { reflection: text } = await res.json()
      setReflection(text)
      // Parse sections from the text
      const secs: Record<string,string> = {}
      REFLECTION_SECTIONS.forEach(sec => {
        const re = new RegExp(`\\*\\*${sec}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i')
        const m = text.match(re)
        if (m) secs[sec] = m[1].trim()
      })
      setReflectionSections(secs)
      setExpandedSections(new Set(REFLECTION_SECTIONS))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setGenerating(false)
    }
  }

  async function saveLog(status: 'draft' | 'complete') {
    if (!user) return
    setSaving(true)
    const { data: log, error: logErr } = await supabase.from('clinical_logs').insert({
      user_id: user.id,
      specialty: form.specialty || null,
      presentation: form.presentation || null,
      procedures_observed: form.proceduresObserved.split('\n').map(s=>s.trim()).filter(Boolean),
      procedures_performed: form.proceduresPerformed.split('\n').map(s=>s.trim()).filter(Boolean),
      learning_points: form.learningPoints || null,
      encounter_date: form.encounterDate || null,
      case_type: form.caseType || null,
      role: form.role || null,
      supervisor: form.supervisor || null,
      status,
    }).select().single()

    if (logErr || !log) { setSaving(false); setError(logErr?.message ?? 'Save failed'); return }
    const logData = log as { id: string }

    if (form.selectedCompetencies.length > 0) {
      await supabase.from('clinical_log_competencies').insert(
        form.selectedCompetencies.map(cid => ({ log_id: logData.id, competency_id: cid }))
      )
    }
    if (reflection) {
      await supabase.from('reflections').insert({
        log_id: logData.id, user_id: user.id, framework: 'Gibbs',
        raw_ai_output: reflection, final_text: reflection,
        approved_at: status === 'complete' ? new Date().toISOString() : null,
      })
    }
    navigate(`/logs/${logData.id}`)
  }

  const byCategory = competencies.reduce<Record<string, Competency[]>>((acc, c) => {
    const cat = c.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(s => s-1) : navigate('/logs')}
          className="w-8 h-8 rounded-xl bg-[#0F1829] border border-[#1E2D45] flex items-center justify-center text-slate-400 hover:text-slate-200">
          ‹
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-100">New log</h1>
          <p className="text-xs text-slate-500">Step {step} of 4</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-1.5 mb-6">
        {[1,2,3,4].map(n => (
          <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: n <= step ? '#14B8A6' : '#1E2D45' }} />
        ))}
      </div>

      {/* ── Step 1: Details ── */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Details</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
                <input type="date" value={form.encounterDate} onChange={e => set('encounterDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Specialty</label>
                <select value={form.specialty} onChange={e => set('specialty', e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-teal-500/50">
                  <option value="">Select…</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Case type</label>
              <div className="flex flex-wrap gap-2">
                {CASE_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set('caseType', t)}
                    className={form.caseType === t ? 'pill-selected' : 'pill-default'}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Your role</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={form.role === r ? 'pill-selected' : 'pill-default'}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Supervisor <span className="text-slate-600 font-normal">(optional)</span></label>
              <input type="text" value={form.supervisor} onChange={e => set('supervisor', e.target.value)}
                placeholder="e.g. Dr Smith"
                className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="btn-teal w-full">Continue →</button>
        </div>
      )}

      {/* ── Step 2: What happened ── */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">What happened?</h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Case summary / presentation *</label>
              <textarea rows={4} value={form.presentation} onChange={e => set('presentation', e.target.value)}
                placeholder="Describe the patient, presentation, and key clinical details…"
                className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Procedures observed <span className="text-slate-600">(one per line)</span></label>
                <textarea rows={3} value={form.proceduresObserved} onChange={e => set('proceduresObserved', e.target.value)}
                  placeholder="IV cannulation&#10;ECG interpretation"
                  className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Procedures performed <span className="text-slate-600">(one per line)</span></label>
                <textarea rows={3} value={form.proceduresPerformed} onChange={e => set('proceduresPerformed', e.target.value)}
                  placeholder="Venepuncture&#10;Urinalysis"
                  className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Learning points</label>
              <textarea rows={2} value={form.learningPoints} onChange={e => set('learningPoints', e.target.value)}
                placeholder="Key takeaways from this encounter…"
                className="w-full px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
            </div>

            {/* Competency tags */}
            {competencies.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Tag competencies</label>
                <div className="space-y-3">
                  {Object.entries(byCategory).map(([cat, comps]) => (
                    <div key={cat}>
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-1.5">{cat}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {comps.map(c => (
                          <button key={c.id} type="button" onClick={() => toggleComp(c.id)}
                            className={form.selectedCompetencies.includes(c.id) ? 'pill-selected text-xs' : 'pill-default text-xs'}>
                            {c.code && <span className="opacity-50 mr-1">{c.code}</span>}{c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => { if (form.presentation.trim()) { setStep(3); generateReflection() } }}
            disabled={!form.presentation.trim()}
            className="btn-teal w-full">
            Generate reflection →
          </button>
        </div>
      )}

      {/* ── Step 3: AI Reflection ── */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          {generating ? (
            <div className="card-premium p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full teal-pulse flex items-center justify-center"
                style={{ background: 'rgba(20,184,166,0.15)', border: '2px solid #14B8A6' }}>
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-200">Generating reflection…</p>
                <p className="text-sm text-slate-500 mt-1">Claude is writing your Gibbs reflection</p>
              </div>
              {/* Blurred teasers */}
              <div className="w-full space-y-2 mt-2">
                {['Clinical Checklist','Red Flags','Questions'].map(s => (
                  <div key={s} className="h-12 rounded-xl bg-[#162035] border border-[#1E2D45] flex items-center px-4">
                    <div className="flex-1 h-3 rounded animate-shimmer" />
                    <span className="text-xs text-slate-600 ml-3">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="card-premium p-5 text-center">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button onClick={generateReflection} className="btn-teal mx-auto">Retry</button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">Review and edit your Gibbs reflection — all sections auto-generated.</p>
              {REFLECTION_SECTIONS.map(sec => {
                const content = reflectionSections[sec] || ''
                const isOpen = expandedSections.has(sec)
                return (
                  <div key={sec} className="card-premium overflow-hidden">
                    <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#162035] transition-colors"
                      onClick={() => setExpandedSections(prev => { const n = new Set(prev); n.has(sec) ? n.delete(sec) : n.add(sec); return n })}>
                      <span className="text-sm font-semibold text-slate-200">{sec}</span>
                      <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-[#1E2D45]">
                        <textarea rows={4} value={content}
                          onChange={e => setReflectionSections(prev => ({ ...prev, [sec]: e.target.value }))}
                          className="w-full mt-3 px-3 py-2.5 bg-[#162035] border border-[#1E2D45] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-teal-500/50 resize-none" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {!generating && (
            <button onClick={() => setStep(4)} disabled={!reflection} className="btn-teal w-full">
              Review & save →
            </button>
          )}
        </div>
      )}

      {/* ── Step 4: Review & Save ── */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Summary</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Date</span><p className="text-slate-200 mt-0.5">{form.encounterDate}</p></div>
              <div><span className="text-slate-500">Specialty</span><p className="text-slate-200 mt-0.5">{form.specialty || '—'}</p></div>
              <div><span className="text-slate-500">Case type</span><p className="text-slate-200 mt-0.5">{form.caseType || '—'}</p></div>
              <div><span className="text-slate-500">Role</span><p className="text-slate-200 mt-0.5">{form.role || '—'}</p></div>
            </div>
            <div className="border-t border-[#1E2D45] pt-3">
              <span className="text-xs text-slate-500">Presentation</span>
              <p className="text-sm text-slate-300 mt-1 line-clamp-3">{form.presentation}</p>
            </div>
            {form.selectedCompetencies.length > 0 && (
              <div className="border-t border-[#1E2D45] pt-3">
                <span className="text-xs text-slate-500">{form.selectedCompetencies.length} competencies tagged</span>
              </div>
            )}
            {reflection && (
              <div className="border-t border-[#1E2D45] pt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-xs text-teal-400">Gibbs reflection ready</span>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => saveLog('draft')} disabled={saving} className="btn-ghost">
              {saving ? '…' : 'Save draft'}
            </button>
            <button onClick={() => saveLog('complete')} disabled={saving} className="btn-teal">
              {saving ? '…' : 'Save & complete'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
