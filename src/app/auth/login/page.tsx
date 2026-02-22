'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('E-Mail oder Passwort falsch.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setError(null)
        alert('Bestätigungs-E-Mail gesendet. Bitte E-Mail-Adresse bestätigen.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <svg width="36" height="32" viewBox="0 0 40 36" fill="none">
            <polygon points="2,0 34,0 30,8 2,8"     fill="white"/>
            <polygon points="2,11 25,11 21,19 2,19"  fill="white"/>
            <polygon points="2,22 16,22 12,30 2,30"  fill="white"/>
            <polygon points="30,0 40,0 30,10"        fill="#E4572E"/>
          </svg>
          <span className="text-2xl font-bold text-white">Fuxion</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'login'
              ? 'Willkommen zurück bei Fuxion.'
              : 'Starte jetzt mit deiner Buchhaltung.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="max@musterfirma.ch"
                className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Passwort
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Bitte warten…'
                : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {mode === 'login'
                ? 'Noch kein Konto? Registrieren'
                : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Schweizer Buchhaltung · DSGVO-konform · Server in der EU
        </p>
      </div>
    </div>
  )
}
