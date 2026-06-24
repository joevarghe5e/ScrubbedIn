import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { specialtyColor, formatDate } from '../../lib/colors'
import type { ClinicalLog } from '../../lib/types'

const FILTER_PILLS = ['All', 'Emergency', 'Elective', 'Clinic', 'Ward', 'Theatre']

export function LogsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ClinicalLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!user) return
    supabase.from('clinical_logs').select('*').eq('user_id', user.id)
      .order('encounter_date', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { setLogs((data as ClinicalLog[]) ?? []); setLoading(false) })
  }, [user])

  const filtered = logs.filter(l => {
    const matchSearch = !search || (l.presentation ?? '').toLowerCase().includes(search.toLowerCase()) || (l.specialty ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || l.case_type === filter
    return matchSearch && matchFilter
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1B2B6B]">Portfolio</h1>
        <Link to="/logs/new" className="btn-teal py-2 px-4 text-sm">+ New log</Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or specialty…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded text-sm text-[#1B2B6B] placeholder-slate-500 focus:outline-none focus:border-[#1B2B6B]" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {FILTER_PILLS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 ${filter === f ? 'pill-selected' : 'pill-default'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1,2,3].map(i => <div key={i} className="h-20 rounded animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-[#4A5568]">{search || filter !== 'All' ? 'No logs found' : 'No logs yet'}</p>
          {!search && filter === 'All' && (
            <Link to="/logs/new" className="inline-block mt-4 btn-teal px-6 py-2.5 text-sm">Log your first case</Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => {
            const col = specialtyColor(log.specialty)
            return (
              <Link key={log.id} to={`/logs/${log.id}`}
                className="card-premium flex items-stretch gap-0 hover:bg-[#EEF2FF] transition-colors overflow-hidden">
                <div className="w-1 flex-shrink-0" style={{ background: col.accent }} />
                <div className="flex-1 min-w-0 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1B2B6B] truncate leading-tight">
                      {log.presentation || 'Untitled encounter'}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        title={log.status === 'complete' ? 'Complete' : 'Draft'} />
                      <span className="text-slate-500">›</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {log.specialty && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: col.bg, color: col.text }}>{log.specialty}</span>
                    )}
                    {log.case_type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4A5568]">{log.case_type}</span>
                    )}
                    {log.role && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4A5568]">{log.role}</span>
                    )}
                    <span className="text-xs text-slate-500">{formatDate(log.encounter_date)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
