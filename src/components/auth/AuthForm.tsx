import { useState } from 'react'

interface Props {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<void>
  error: string | null
  loading: boolean
}

export function AuthForm({ mode, onSubmit, error, loading }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-white border border-[#1B2B6B] hover:bg-[#EEF2FF] disabled:opacity-50 text-[#1B2B6B] font-semibold rounded transition-colors"
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}
