import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '../../components/auth/AuthForm'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(email: string, password: string) {
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-700">ScrubbedIn</h1>
          <p className="text-gray-500 mt-1 text-sm">Your clinical portfolio, made useful.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Sign in</h2>
          <AuthForm mode="login" onSubmit={handleSubmit} error={error} loading={loading} />
          <p className="text-sm text-center text-gray-500 mt-4">
            No account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
