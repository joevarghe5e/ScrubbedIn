import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '../../components/auth/AuthForm'
import { useAuth } from '../../contexts/AuthContext'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(email: string, password: string) {
    setError(null)
    setLoading(true)
    const { error, data } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data.session) {
      // Email confirmation disabled — go straight to onboarding
      navigate('/onboarding')
    } else {
      // Confirmation email sent
      setConfirmed(true)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We've sent a confirmation link. Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="mt-4 inline-block text-brand-600 hover:underline text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-700">ScrubbedIn</h1>
          <p className="text-gray-500 mt-1 text-sm">Your clinical portfolio, made useful.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Create account</h2>
          <AuthForm mode="register" onSubmit={handleSubmit} error={error} loading={loading} />
          <p className="text-sm text-center text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
