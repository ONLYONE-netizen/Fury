'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '28px', background: '#1a1a18', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a18' }}>Fury</span>
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '6px', color: '#1a1a18' }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: '#9a9a94' }}>Free forever. No credit card required.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '14px', padding: '32px' }}>
          <form onSubmit={handleSignup}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '6px' }}>Email</label>
                <input style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e8e6', borderRadius: '9px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fafaf9', color: '#1a1a18' }}
                  type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '6px' }}>Password</label>
                <input style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e8e6', borderRadius: '9px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fafaf9', color: '#1a1a18' }}
                  type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                <input style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e8e6', borderRadius: '9px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fafaf9', color: '#1a1a18' }}
                  type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              {error && <p style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ background: '#1a1a18', color: '#fff', padding: '12px', borderRadius: '9px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creating account...' : 'Try Fury Free'}
              </button>
              <p style={{ fontSize: '11px', color: '#9a9a94', textAlign: 'center', lineHeight: 1.6 }}>
                By signing up you agree to our terms. No spam ever.
              </p>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9a9a94', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1a1a18', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
