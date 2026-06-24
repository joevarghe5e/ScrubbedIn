import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import type { Competency } from '../../lib/types'

interface CompetencyWithStatus extends Competency {
  status: 'not_started' | 'observed' | 'performed' | 'signed_off'
  logCount: number
}

const STATUS_ORDER = ['signed_off', 'performed', 'observed', 'not_started'] as const
const STATUS_LABEL: Record<string, string> = {
  signed_off: 'Signed off',
  performed: 'Performed',
  observed: 'Observed',
  not_started: 'Not started',
}
const STATUS_COLOR: Record<string, string> = {
  signed_off: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  performed: 'bg-[#EEF2FF] text-[#1B2B6B] border-[#C7D2FE]',
  observed: 'bg-amber-50 text-amber-700 border-amber-200',
  not_started: 'bg-gray-50 text-slate-500 border-[#E2E8F0]',
}
const BAR_COLOR: Record<string, string> = {
  signed_off: 'bg-emerald-500',
  performed: 'bg-[#1B2B6B]',
  observed: 'bg-amber-400',
  not_started: 'bg-gray-200',
}

export function ProgressPage() {
  const { user, profile } = useAuth()
  const [competencies, setCompetencies] = useState<CompetencyWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('All')

  useEffect(() => {
    if (!user || !profile) return
    const curriculum = profile.curriculum ?? 'UKMLA'

    async function load() {
      const [compRes, progressRes, logIdRes] = await Promise.all([
        supabase.from('competencies').select('*').eq('curriculum', curriculum).order('category').order('code'),
        supabase.from('user_competency_progress').select('*').eq('user_id', user!.id),
        supabase.from('clinical_logs').select('id').eq('user_id', user!.id),
      ])

      const ids = (logIdRes.data ?? []).map((r: { id: string }) => r.id)
      let logCounts: Record<string, number> = {}
      if (ids.length > 0) {
        const { data: lcRows } = await supabase
          .from('clinical_log_competencies')
          .select('competency_id')
          .in('log_id', ids)
        ;(lcRows ?? []).forEach((r: { competency_id: string }) => {
          logCounts[r.competency_id] = (logCounts[r.competency_id] ?? 0) + 1
        })
      }

      const progressMap: Record<string, string> = {}
      ;(progressRes.data ?? []).forEach((r: { competency_id: string; status: string }) => {
        progressMap[r.competency_id] = r.status
      })

      const enriched: CompetencyWithStatus[] = ((compRes.data as Competency[]) ?? []).map(c => ({
        ...c,
        status: (progressMap[c.id] as CompetencyWithStatus['status']) ?? (logCounts[c.id] ? 'observed' : 'not_started'),
        logCount: logCounts[c.id] ?? 0,
      }))

      setCompetencies(enriched)
      setLoading(false)
    }
    load()
  }, [user, profile])

  const categories = ['All', ...Array.from(new Set(competencies.map(c => c.category ?? 'Other')))]
  const filtered = filterCategory === 'All' ? competencies : competencies.filter(c => (c.category ?? 'Other') === filterCategory)

  const counts = {
    total: filtered.length,
    signed_off: filtered.filter(c => c.status === 'signed_off').length,
    performed: filtered.filter(c => c.status === 'performed').length,
    observed: filtered.filter(c => c.status === 'observed').length,
    not_started: filtered.filter(c => c.status === 'not_started').length,
  }

  const pct = (n: number) => counts.total ? Math.round((n / counts.total) * 100) : 0

  return (
    <Layout>
      <h1 className="text-xl font-bold text-[#1B2B6B] mb-2">Curriculum Progress</h1>
      <p className="text-sm text-[#4A5568] mb-6">{profile?.curriculum ?? 'UKMLA'} · Based on your logged cases</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {STATUS_ORDER.map(s => (
              <div key={s} className="bg-white rounded border border-[#E2E8F0] p-4">
                <p className="text-2xl font-bold text-[#1B2B6B]">{counts[s]}</p>
                <p className="text-xs text-[#4A5568] mt-0.5">{STATUS_LABEL[s]}</p>
                <p className="text-xs text-slate-400">{pct(counts[s])}% of {counts.total}</p>
              </div>
            ))}
          </div>

          {/* Stacked progress bar */}
          <div className="bg-white rounded border border-[#E2E8F0] p-4 mb-6">
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {STATUS_ORDER.filter(s => counts[s] > 0).map(s => (
                <div
                  key={s}
                  className={`${BAR_COLOR[s]} transition-all`}
                  style={{ width: `${pct(counts[s])}%` }}
                  title={`${STATUS_LABEL[s]}: ${counts[s]}`}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              {STATUS_ORDER.map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${BAR_COLOR[s]}`} />
                  <span className="text-xs text-[#4A5568]">{STATUS_LABEL[s]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterCategory === cat
                    ? 'border-[#1B2B6B] bg-[#EEF2FF] text-[#1B2B6B]'
                    : 'border-[#E2E8F0] text-slate-500 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Competency list */}
          <div className="space-y-2">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded border border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2B6B]">
                    {c.code && <span className="text-slate-500 mr-1.5">{c.code}</span>}
                    {c.name}
                  </p>
                  {c.logCount > 0 && (
                    <p className="text-xs text-[#4A5568] mt-0.5">{c.logCount} case{c.logCount > 1 ? 's' : ''} logged</p>
                  )}
                </div>
                <StatusBadge status={c.status} logCount={c.logCount} competencyId={c.id} userId={user!.id} onUpdate={(id, status) => {
                  setCompetencies(prev => prev.map(x => x.id === id ? { ...x, status } : x))
                }} />
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}

function StatusBadge({
  status, logCount, competencyId, userId, onUpdate
}: {
  status: CompetencyWithStatus['status']
  logCount: number
  competencyId: string
  userId: string
  onUpdate: (id: string, status: CompetencyWithStatus['status']) => void
}) {
  const [updating, setUpdating] = useState(false)

  async function markSignedOff() {
    if (status === 'signed_off') return
    setUpdating(true)
    await supabase.from('user_competency_progress').upsert({
      user_id: userId,
      competency_id: competencyId,
      status: 'signed_off',
      updated_at: new Date().toISOString(),
    })
    setUpdating(false)
    onUpdate(competencyId, 'signed_off')
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLOR[status]}`}>
        {STATUS_LABEL[status]}
      </span>
      {status !== 'signed_off' && logCount > 0 && (
        <button
          onClick={markSignedOff}
          disabled={updating}
          title="Mark as signed off"
          className="text-xs text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
        >
          ✓
        </button>
      )}
    </div>
  )
}
