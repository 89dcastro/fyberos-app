'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const resolveRes = await fetch('/api/auth/resolve-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      })
      console.log('resolve status:', resolveRes.status)

      const resolveData = await resolveRes.json()

      if (!resolveRes.ok) {
        setError(resolveData.error || 'Could not resolve login')
        setLoading(false)
        return
      }

      const email = String(resolveData.email || '').trim().toLowerCase()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      window.location.href = '/'
    } catch (err: any) {
  console.error('LOGIN ERROR:', err)
  setError(err?.message || 'Unexpected error during login')
  setLoading(false)
}


  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fyber-bg text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          FyberOS Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-white/60">Username or Email</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-2 font-semibold text-black transition hover:bg-cyan-400"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}