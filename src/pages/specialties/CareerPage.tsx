import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { AnimatedBar } from '../../components/ui/AnimatedBar'
import { specialtyColor } from '../../lib/colors'

const ALL_SPECIALTIES = [
  'General Medicine','Surgery','Paediatrics','Psychiatry','General Practice',
  'Emergency Medicine','Obs & Gynae','Anaesthetics','Radiology','Cardiology',
  'Neurology','Orthopaedics','Oncology','Dermatology','ENT',
]

interface Requirement {
  id: string
  specialty: string
  requirement_type: string
  requirement_name: string
  minimum_count: number
}

interface LogCount { case_type: string; count: number }

export function CareerPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [logCounts, setLogCounts] = useState<Record<string, number>>({})
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const interests: string[] = profile?.specialty_interests ?? []

  useEffect(() => {
    if (!user) return
    setSelected(interests)
    Promise.all([
      supabase.from('specialty_requirements').select('*').in('specialty', interests.length ? interests : ['__none__']),
      supabase.from('clinical_logs').select('case_type').eq('user_id', user.id),
    ]).then(([reqRes, logsRes]) => {
      setRequirements((reqRes.data as Requirement[]) ?? [])
      const counts: Record<string, number> = {}
      ;((logsRes.data as LogCount[]) ?? []).forEach(l => {
        const k = l.case_type ?? 'Other'
        counts[k] = (counts[k] ?? 0) + 1
      })
      setLogCounts(counts)
      setLoading(false)
    })
  }, [user, profile])

  async function saveInterests() {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({ specialty_interests: selected }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setEditOpen(false)
  }

  function toggle(s: string) {
    setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  }

  // Aggregate requirement progress across all interest specialties
  const reqMap: Record<string, { name: string; type: string; required: number; done: number }> = {}
  requirements.forEach(r => {
    const key = r.requirement_type
    if (!reqMap[key]) reqMap[key] = { name: r.requirement_name, type: r.requirement_type, required: 0, done: 0 }
    reqMap[key].required += r.minimum_count
    // Map requirement types to log case_types roughly
    const typeMap: Record<string, string> = {
      emergency_case: 'Emergency', elective_case: 'Elective', clinic_case: 'Clinic',
      ward_case: 'Ward', theatre_case: 'Theatre',
    }
    reqMap[key].done += logCounts[typeMap[key]] ?? 0
  })
  const reqs = Object.values(reqMap)
  const gaps = reqs.filter(r => r.required > 0 && r.done / r.required < 0.5)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-100">Career</h1>
      </div>

      {/* Specialty targets */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">Your Specialty Targets</h2>
          <button onClick={() => { setSelected(interests); setEditOpen(true) }}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
            ✏️ Edit
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0,1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-shimmer" />)}
          </div>
        ) : interests.length === 0 ? (
          <div className="card-premium p-6 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm text-slate-400 mb-3">No specialty targets set</p>
            <button onClick={() => setEditOpen(true)} className="btn-teal text-sm px-5 py-2">Add specialties</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {interests.map(sp => {
              const col = specialtyColor(sp)
              return (
                <div key={sp} className="card-premium overflow-hidden">
                  <div className="h-0.5" style={{ background: col.accent }} />
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.accent }} />
                    <span className="text-sm font-medium text-slate-200 leading-tight">{sp}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Combined requirements */}
      {reqs.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-slate-200 mb-3">Combined Requirements</h2>
          <div className="card-premium p-4 space-y-4">
            {reqs.map(r => {
              const pct = r.required > 0 ? Math.min(100, Math.round((r.done / r.required) * 100)) : 0
              return (
                <div key={r.type}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium capitalize">{r.name}</span>
                    <span className="text-slate-500">{r.done}/{r.required}</span>
                  </div>
                  <AnimatedBar pct={pct} color={pct >= 100 ? '#14B8A6' : pct >= 50 ? '#6366F1' : '#F59E0B'} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Gap analysis */}
      {gaps.length > 0 && (
        <section>
          <h2 className="font-semibold text-slate-200 mb-3">Gap Analysis</h2>
          <div className="space-y-2">
            {gaps.map(g => (
              <div key={g.type} className="card-premium p-4 border-l-2 border-amber-500/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200 capitalize">{g.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {g.done} of {g.required} required — {Math.round((g.done / g.required) * 100)}% complete
                    </p>
                  </div>
                  <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
                </div>
                <div className="mt-2.5">
                  <AnimatedBar pct={Math.round((g.done / g.required) * 100)} color="#F59E0B" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && reqs.length === 0 && !loading && (
        <div className="card-premium p-6 text-center mt-4">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm text-slate-400">Requirements data loading…</p>
        </div>
      )}

      {/* Edit specialties bottom sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit Specialty Targets">
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_SPECIALTIES.map(s => (
            <button key={s} onClick={() => toggle(s)}
              className={selected.includes(s) ? 'pill-selected' : 'pill-default'}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={saveInterests} disabled={saving} className="btn-teal w-full">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </BottomSheet>
    </Layout>
  )
}
