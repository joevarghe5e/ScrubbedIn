import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'

interface ExamSyllabus {
  id: string
  exam: string
  topic: string
  subtopic: string | null
  tags: string[] | null
}

const EXAM_COLORS: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  'MSRA':         { bg: 'rgba(27,43,107,0.08)',   text: '#1B2B6B', accent: '#1B2B6B', border: 'rgba(27,43,107,0.25)' },
  'MRCS':         { bg: 'rgba(99,102,241,0.10)',  text: '#4338CA', accent: '#6366F1', border: 'rgba(99,102,241,0.3)' },
  'MRCP Part 1':  { bg: 'rgba(245,158,11,0.10)',  text: '#B45309', accent: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  'MRCGP AKT':    { bg: 'rgba(16,185,129,0.10)',  text: '#0F766E', accent: '#10B981', border: 'rgba(16,185,129,0.3)' },
  'MRCEM Primary':{ bg: 'rgba(239,68,68,0.10)',   text: '#B91C1C', accent: '#EF4444', border: 'rgba(239,68,68,0.3)' },
}

function examColor(exam: string) {
  return EXAM_COLORS[exam] ?? { bg: 'rgba(100,116,139,0.10)', text: '#334155', accent: '#64748B', border: 'rgba(100,116,139,0.3)' }
}

export function ExamsPage() {
  const [syllabi, setSyllabi] = useState<ExamSyllabus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeExam, setActiveExam] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase.from('exam_syllabi').select('*').order('exam').order('topic')
      .then(({ data }) => {
        const rows = (data as ExamSyllabus[]) ?? []
        setSyllabi(rows)
        const exams = [...new Set(rows.map(r => r.exam))]
        if (exams.length > 0) setActiveExam(exams[0])
        setLoading(false)
      })
  }, [])

  const exams = [...new Set(syllabi.map(r => r.exam))]
  const filtered = activeExam ? syllabi.filter(r => r.exam === activeExam) : []
  const topics = [...new Set(filtered.map(r => r.topic))]

  // Find overlapping topics across all exams
  const topicExamMap: Record<string, string[]> = {}
  syllabi.forEach(r => {
    if (!topicExamMap[r.topic]) topicExamMap[r.topic] = []
    if (!topicExamMap[r.topic].includes(r.exam)) topicExamMap[r.topic].push(r.exam)
  })
  const overlapping = Object.entries(topicExamMap)
    .filter(([, exs]) => exs.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)

  function toggleExpand(topic: string) {
    setExpanded(p => { const n = new Set(p); n.has(topic) ? n.delete(topic) : n.add(topic); return n })
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1B2B6B]">Exams</h1>
      </div>

      {/* High-yield overlap section */}
      {overlapping.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-[#1B2B6B] mb-1">High-Yield Topics</h2>
          <p className="text-xs text-[#4A5568] mb-3">Topics across multiple exams — study these first</p>
          <div className="space-y-2">
            {overlapping.map(([topic, exs]) => (
              <div key={topic} className="card-premium p-3.5">
                <p className="text-sm font-semibold text-[#1B2B6B] mb-2">{topic}</p>
                <div className="flex flex-wrap gap-1.5">
                  {exs.map(ex => {
                    const col = examColor(ex)
                    return (
                      <span key={ex} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                        {ex}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exam selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {loading ? (
          [0,1,2,3].map(i => <div key={i} className="h-8 w-24 rounded-full animate-shimmer flex-shrink-0" />)
        ) : (
          exams.map(ex => {
            const col = examColor(ex)
            const isActive = activeExam === ex
            return (
              <button key={ex} onClick={() => setActiveExam(ex)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                style={isActive
                  ? { background: col.bg, color: col.text, border: `1px solid ${col.border}` }
                  : { background: 'transparent', color: '#4A5568', border: '1px solid #E2E8F0' }}>
                {ex}
              </button>
            )
          })
        )}
      </div>

      {/* Topics for active exam */}
      {activeExam && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1B2B6B]">{activeExam} Syllabus</h2>
            <span className="text-xs text-[#4A5568]">{topics.length} topics</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-12 rounded animate-shimmer" />)}</div>
          ) : (
            <div className="space-y-1.5">
              {topics.map(topic => {
                const subtopics = filtered.filter(r => r.topic === topic && r.subtopic)
                const col = examColor(activeExam)
                const isOpen = expanded.has(topic)
                const isOverlap = (topicExamMap[topic]?.length ?? 0) > 1
                return (
                  <div key={topic} className="card-premium overflow-hidden">
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2FF] transition-colors"
                      onClick={() => subtopics.length > 0 && toggleExpand(topic)}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.accent }} />
                      <span className="flex-1 text-sm text-[#4A5568] text-left">{topic}</span>
                      {isOverlap && <span className="text-xs text-amber-600 flex-shrink-0">★ High-yield</span>}
                      {subtopics.length > 0 && (
                        <span className="text-slate-500 text-xs flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                      )}
                    </button>
                    {isOpen && subtopics.length > 0 && (
                      <div className="px-4 pb-3 border-t border-[#E2E8F0]">
                        <ul className="mt-2 space-y-1">
                          {subtopics.map(r => (
                            <li key={r.id} className="flex gap-2 text-xs text-[#4A5568]">
                              <span className="text-[#1B2B6B] flex-shrink-0">–</span>{r.subtopic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </Layout>
  )
}
