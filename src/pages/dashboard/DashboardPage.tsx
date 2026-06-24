import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { AnimatedBar } from '../../components/ui/AnimatedBar'
import { specialtyColor, formatDate } from '../../lib/colors'
import type { ClinicalLog, Competency, CompetencyStatus } from '../../lib/types'

interface Stats { logsThisMonth: number; competenciesDone: number; streak: number }
interface CompCategory { name: string; total: number; done: number }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function computeStreak(logs: ClinicalLog[]) {
  if (!logs.length) return 0
  const dates = [...new Set(logs.map(l => l.encounter_date).filter(Boolean))].sort().reverse() as string[]
  let streak = 0, check = new Date()
  check.setHours(0,0,0,0)
  for (const d of dates) {
    const logDate = new Date(d)
    logDate.setHours(0,0,0,0)
    const diff = Math.round((check.getTime() - logDate.getTime()) / 86400000)
    if (diff <= 1) { streak++; check = logDate } else break
  }
  return streak
}

export function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ logsThisMonth: 0, competenciesDone: 0, streak: 0 })
  const [recentLogs, setRecentLogs] = useState<ClinicalLog[]>([])
  const [categories, setCategories] = useState<CompCategory[]>([])
  const [loading, setLoading] = useState(true)

  const name = user?.email?.split('@')[0] ?? 'Doctor'

  useEffect(() => {
    if (!user || !profile) return
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
    const curriculum = profile.curriculum ?? 'UKMLA'

    Promise.all([
      supabase.from('clinical_logs').select('*').eq('user_id', user.id).order('encounter_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('user_competency_progress').select('competency_id, status').eq('user_id', user.id),
      supabase.from('competencies').select('id, category').eq('curriculum', curriculum),
    ]).then(([logsRes, progressRes, compsRes]) => {
      const logs = (logsRes.data as ClinicalLog[]) ?? []
      const progress = (progressRes.data ?? []) as { competency_id: string; status: CompetencyStatus }[]
      const comps = (compsRes.data as Competency[]) ?? []

      const logsThisMonth = logs.filter(l => l.encounter_date && new Date(l.encounter_date) >= monthStart).length
      const competenciesDone = progress.filter(p => p.status === 'signed_off').length
      const streak = computeStreak(logs)

      // Category progress
      const doneIds = new Set(progress.filter(p => p.status === 'signed_off').map(p => p.competency_id))
      const catMap: Record<string, { total: number; done: number }> = {}
      comps.forEach(c => {
        const cat = c.category ?? 'Other'
        if (!catMap[cat]) catMap[cat] = { total: 0, done: 0 }
        catMap[cat].total++
        if (doneIds.has(c.id)) catMap[cat].done++
      })
      const cats = Object.entries(catMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.done - a.done)
        .slice(0, 6)

      setStats({ logsThisMonth, competenciesDone, streak })
      setRecentLogs(logs.slice(0, 3))
      setCategories(cats)
      setLoading(false)
    })
  }, [user, profile])

  return (
    <Layout>
      {/* Greeting */}
      <div className="relative mb-6 overflow-hidden rounded p-5 bg-[#EEF2FF] border border-[#E2E8F0]">
        <p className="text-sm text-[#4A5568]">{greeting()},</p>
        <h1 className="text-2xl font-bold text-[#1B2B6B] mt-0.5 capitalize">{name}</h1>
        {profile?.training_stage && (
          <p className="text-sm text-[#4A5568] mt-1">{profile.training_stage} · {profile.curriculum}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Logs this month', value: stats.logsThisMonth, icon: '🩺' },
          { label: 'Competencies done', value: stats.competenciesDone, icon: '✅' },
          { label: 'Day streak', value: stats.streak, icon: '🔥' },
        ].map(s => (
          <div key={s.label} className="card-premium p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-[#1B2B6B]">{loading ? '—' : s.value}</div>
            <div className="text-xs text-[#4A5568] mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/placement" className="btn-teal text-sm py-3">
          📅 Prep for today
        </Link>
        <Link to="/logs" className="btn-ghost text-sm">
          🩺 View portfolio
        </Link>
      </div>

      {/* Recent logs */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1B2B6B]">Recent logs</h2>
          <Link to="/logs" className="text-xs text-[#1B2B6B] hover:underline">See all</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-16 rounded animate-shimmer" />)}</div>
        ) : recentLogs.length === 0 ? (
          <div className="card-premium p-6 text-center">
            <p className="text-[#4A5568] text-sm">No logs yet — <Link to="/logs/new" className="text-[#1B2B6B]">log your first case</Link></p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => {
              const col = specialtyColor(log.specialty)
              return (
                <Link key={log.id} to={`/logs/${log.id}`}
                  className="card-premium flex items-center gap-3 p-4 hover:bg-[#EEF2FF] transition-colors">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: col.accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B2B6B] truncate">{log.presentation || 'Untitled encounter'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {log.specialty && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: col.bg, color: col.text }}>{log.specialty}</span>
                      )}
                      {log.role && (
                        <span className="text-xs text-[#4A5568]">{log.role}</span>
                      )}
                      <span className="text-xs text-slate-500">{formatDate(log.encounter_date)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${log.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-slate-500 text-sm">›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Competency progress */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1B2B6B]">Competency progress</h2>
            <Link to="/progress" className="text-xs text-[#1B2B6B] hover:underline">Full view</Link>
          </div>
          <div className="card-premium p-4 space-y-3">
            {categories.map(cat => {
              const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#4A5568] font-medium">{cat.name}</span>
                    <span className="text-slate-500">{pct}%</span>
                  </div>
                  <AnimatedBar pct={pct} />
                </div>
              )
            })}
          </div>
        </section>
      )}
    </Layout>
  )
}
