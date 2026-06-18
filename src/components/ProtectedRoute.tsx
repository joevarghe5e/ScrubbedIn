import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requireOnboarding && profile && !profile.onboarding_complete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
