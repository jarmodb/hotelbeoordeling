import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Account aangemaakt. Check je mail om te bevestigen, log daarna in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <h1>Hotelbeoordelingen</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Wachtwoord
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="error">{error}</p>}
        {info && <p className="info">{info}</p>}
        <button type="submit" disabled={busy}>
          {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
        </button>
      </form>
      <button
        className="link-button"
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setError(null)
          setInfo(null)
        }}
      >
        {mode === 'login' ? 'Nog geen account? Registreren' : 'Al een account? Inloggen'}
      </button>
    </div>
  )
}
