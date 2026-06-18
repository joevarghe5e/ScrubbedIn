import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LogsPage } from './pages/logs/LogsPage'
import { NewLogPage } from './pages/logs/NewLogPage'
import { LogDetailPage } from './pages/logs/LogDetailPage'
import { PlacementPage } from './pages/placement/PlacementPage'
import { SessionDetailPage } from './pages/placement/SessionDetailPage'
import { ProgressPage } from './pages/progress/ProgressPage'
import { CareerPage } from './pages/specialties/CareerPage'
import { ExamsPage } from './pages/exams/ExamsPage'
import { ProfilePage } from './pages/profile/ProfilePage'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.onboarding_complete) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/logs"        element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
      <Route path="/logs/new"    element={<ProtectedRoute><NewLogPage /></ProtectedRoute>} />
      <Route path="/logs/:id"    element={<ProtectedRoute><LogDetailPage /></ProtectedRoute>} />
      <Route path="/placement"             element={<ProtectedRoute><PlacementPage /></ProtectedRoute>} />
      <Route path="/placement/session/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
      <Route path="/progress"    element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/career"      element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />
      <Route path="/specialties" element={<Navigate to="/career" replace />} />
      <Route path="/exams"       element={<ProtectedRoute><ExamsPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
