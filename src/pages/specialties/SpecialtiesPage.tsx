import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import type { SpecialtyRequirement } from '../../lib/types'

interface GroupedReq {
  requirement_type: string
  requirement_name: string
  minimum_count: number
  specialties: string[]        // which selected specialties require it
  userCount: number
  isOverlap: boolean           // required by >1 selected specialty
}

const TYPE_ICON: Record<string, string> = {
  teaching_session: '🎓',
  audit: '📊',
  paper: '📄',
  procedure: '🔬',
  case_log: '🩺',
  presentation: '🎤',
  qip: '⚙️',
}

export function SpecialtiesPage() {
  const { user, profile } = useAuth()
  const [allReqs, setAllReqs] = useState<SpecialtyRequirement[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [logCounts, setLogCounts] = useState<Record<string, number>>({}) // specialty → count
  const [loading, setLoading] = useState(true)
  const [filterOverlap, setFilterOverlap] = useState(false)

  useEffect(() => {
    if (!user || !profile) return
    Promise.all([
      supabase.from('specialty_requirements').select('*').order('specialty').order('requirement_type'),
      supabase.from('clinical_logs').select('specialty').eq('user_id', user.id),
    ]).then(([reqRes, logRes]) => {
      setAllReqs((reqRes.data as SpecialtyRequirement[]) ?? [])

      // Count logs per specialty
      const counts: Record<string, number> = {}
      ;(logRes.data ?? []).forEach((r: { specialty: string | null }) => {
        if (r.specialty) counts[r.specialty] = (counts[r.specialty] ?? 0) + 1
      })
      setLogCounts(counts)

      // Pre-select user's specialty interests
      setSelectedSpecialties(profile.specialty_interests ?? [])
      setLoading(false)
    })
  }, [user, profile])

  function toggleSpecialty(s: string) {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  // Get unique specialties from requirements
  const availableSpecialties = Array.from(new Set(allReqs.map(r => r.specialty))).sort()

  // Compute union of requirements across selected specialties
  const grouped: Record<string, GroupedReq> = {}
  allReqs
    .filter(r => selectedSpecialties.includes(r.specialty))
    .forEach(r => {
      const key = `${r.requirement_type}::${r.requirement_name}`
      if (!grouped[key]) {
        grouped[key] = {
          requirement_type: r.requirement_type ?? '',
          requirement_name: r.requirement_name ?? '',
          minimum_count: r.minimum_count ?? 1,
          specialties: [],
          userCount: 0,
          isOverlap: false,
        }
      }
      grouped[key].specialties.push(r.specialty)
      grouped[key].minimum_count = Math.max(grouped[key].minimum_count, r.minimum_count ?? 1)
    })

  const reqList = Object.values(grouped).map(r => ({
    ...r,
    isOverlap: r.specialties.length > 1,
  })).sort((a, b) => {
    if (a.isOverlap !== b.isOverlap) return a.isOverlap ? -1 : 1
    return a.requirement_type.localeCompare(b.requirement_type)
  })

  const displayed = filterOverlap ? reqList.filter(r => r.isOverlap) : reqList

  // Rough progress estimation: count logs as "case_log" progress
  function getProgress(req: GroupedReq): number {
    if (req.requirement_type === 'case_log') {
      const relevantLogs = req.specialties.reduce((sum, s) => sum + (logCounts[s] ?? 0), 0)
      return Math.min(relevantLogs, req.minimum_count)
    }
    return 0
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-[#1B2B6B] mb-2">Specialty Requirements</h1>
      <p className="text-sm text-[#4A5568] mb-5">Select target specialties to see their portfolio requirements and where they overlap.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#1B2B6B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Specialty selector */}
          <div className="bg-white rounded border border-[#E2E8F0] p-4 mb-5">
            <p className="text-sm font-medium text-[#4A5568] mb-3">Target specialties</p>
            <div className="flex flex-wrap gap-2">
              {availableSpecialties.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-colors ${
                    selectedSpecialties.includes(s)
                      ? 'border-[#1B2B6B] bg-[#EEF2FF] text-[#1B2B6B]'
                      : 'border-[#E2E8F0] text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {selectedSpecialties.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-sm">Select at least one specialty above to see requirements.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded border border-[#E2E8F0] p-3 text-center">
                  <p className="text-xl font-bold text-[#1B2B6B]">{reqList.length}</p>
                  <p className="text-xs text-[#4A5568]">Total requirements</p>
                </div>
                <div className="bg-white rounded border border-[#E2E8F0] p-3 text-center">
                  <p className="text-xl font-bold text-[#1B2B6B]">{reqList.filter(r => r.isOverlap).length}</p>
                  <p className="text-xs text-[#4A5568]">Shared across specialties</p>
                </div>
                <div className="bg-white rounded border border-[#E2E8F0] p-3 text-center">
                  <p className="text-xl font-bold text-[#1B2B6B]">{reqList.filter(r => !r.isOverlap).length}</p>
                  <p className="text-xs text-[#4A5568]">Specialty-specific</p>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFilterOverlap(false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!filterOverlap ? 'border-[#1B2B6B] bg-[#EEF2FF] text-[#1B2B6B]' : 'border-[#E2E8F0] text-slate-500'}`}
                >
                  All requirements
                </button>
                <button
                  onClick={() => setFilterOverlap(true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterOverlap ? 'border-[#1B2B6B] bg-[#EEF2FF] text-[#1B2B6B]' : 'border-[#E2E8F0] text-slate-500'}`}
                >
                  Overlaps only ✨
                </button>
              </div>

              {/* Requirements list */}
              <div className="space-y-2">
                {displayed.map((req, i) => {
                  const progress = getProgress(req)
                  const pct = req.minimum_count > 0 ? Math.min(100, Math.round((progress / req.minimum_count) * 100)) : 0
                  return (
                    <div
                      key={i}
                      className={`bg-white rounded border p-4 ${req.isOverlap ? 'border-[#C7D2FE]' : 'border-[#E2E8F0]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{TYPE_ICON[req.requirement_type] ?? '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[#1B2B6B]">{req.requirement_name}</p>
                            {req.isOverlap && (
                              <span className="text-xs bg-[#EEF2FF] text-[#1B2B6B] border border-[#C7D2FE] rounded-full px-1.5 py-0.5">
                                Shared
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#4A5568] mt-0.5">
                            Required by: {req.specialties.join(', ')} · Min. {req.minimum_count}
                          </p>
                          {req.requirement_type === 'case_log' && progress > 0 && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#1B2B6B] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-xs text-[#4A5568] mt-0.5">{progress}/{req.minimum_count} from logs</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
