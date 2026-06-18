import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/Layout'
import { BottomSheet } from '../../components/ui/BottomSheet'

const TRAINING_STAGES = ['MS3','MS4','MS5','FY1','FY2','ST1+','Other']
const CURRICULA = ['UKMLA','USMLE','AMC','PLAB']

export function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [editField, setEditField] = useState<'stage'|'curriculum'|'name'|null>(null)
  const [saving, setSaving] = useState(false)

  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0,2).toUpperCase()

  async function saveField(updates: Record<string, unknown>) {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update(updates).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setEditField(null)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const rows = [
    { label: 'Email', value: user?.email ?? '—', icon: '✉️', editable: false },
    { label: 'Training stage', value: profile?.training_stage ?? '—', icon: '🎓', editable: true, onClick: () => setEditField('stage') },
    { label: 'Curriculum', value: profile?.curriculum ?? '—', icon: '📚', editable: true, onClick: () => setEditField('curriculum') },
  ]

  return (
    <Layout>
      <h1 className="text-xl font-bold text-slate-100 mb-5">Profile</h1>

      {/* Avatar card */}
      <div className="card-premium p-5 flex items-center gap-4 mb-5"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(20,184,166,0.12) 0%, rgba(8,14,26,0) 60%), #0F1829' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-teal-300 flex-shrink-0"
          style={{ background: 'rgba(20,184,166,0.15)', border: '2px solid rgba(20,184,166,0.4)' }}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-100 capitalize">{user?.email?.split('@')[0] ?? 'User'}</p>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
          {profile?.training_stage && (
            <p className="text-xs text-teal-400 mt-1">{profile.training_stage} · {profile.curriculum}</p>
          )}
        </div>
      </div>

      {/* Settings rows */}
      <div className="card-premium divide-y divide-[#1E2D45] mb-5">
        {rows.map(r => (
          <button key={r.label}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left ${r.editable ? 'hover:bg-[#162035] transition-colors' : 'cursor-default'}`}
            onClick={r.editable ? r.onClick : undefined}
            disabled={!r.editable}>
            <span className="text-lg flex-shrink-0">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">{r.label}</p>
              <p className="text-sm text-slate-200 mt-0.5">{r.value}</p>
            </div>
            {r.editable && <span className="text-slate-600 text-sm">›</span>}
          </button>
        ))}
      </div>

      {/* App info */}
      <div className="card-premium divide-y divide-[#1E2D45] mb-6">
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="text-lg">ℹ️</span>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Version</p>
            <p className="text-sm text-slate-200">ScrubbedIn MVP 1.0</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut}
        className="w-full py-3 rounded-2xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
        Sign out
      </button>

      {/* Edit training stage */}
      <BottomSheet open={editField === 'stage'} onClose={() => setEditField(null)} title="Training Stage">
        <div className="flex flex-wrap gap-2 mb-6">
          {TRAINING_STAGES.map(s => (
            <button key={s} onClick={() => saveField({ training_stage: s })}
              className={profile?.training_stage === s ? 'pill-selected' : 'pill-default'}>
              {saving ? '…' : s}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Edit curriculum */}
      <BottomSheet open={editField === 'curriculum'} onClose={() => setEditField(null)} title="Curriculum">
        <div className="flex flex-wrap gap-2 mb-6">
          {CURRICULA.map(c => (
            <button key={c} onClick={() => saveField({ curriculum: c })}
              className={profile?.curriculum === c ? 'pill-selected' : 'pill-default'}>
              {saving ? '…' : c}
            </button>
          ))}
        </div>
      </BottomSheet>
    </Layout>
  )
}
