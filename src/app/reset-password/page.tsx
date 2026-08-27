'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Min 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else router.push('/login')
    setLoading(false)
  }

  const inp: any = { width: '100%', padding: '11px 14px', border: '1px solid #e8e8e6', borderRadius: '9px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fafaf9', color: '#1a1a18' }

  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '20px', fontWeight: 600, color: '#1a1a18', display: 'block', marginBottom: '8px' }}>Fury</Link>
          <p style={{ fontSize: '14px', color: '#9a9a94' }}>Set your new password</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '14px', padding: '32px' }}>
          {!ready ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#9a9a94', fontSize: '14px', marginBottom: '16px' }}>This link is invalid or expired.</p>
              <Link href="/login" style={{ color: '#1a1a18', fontWeight: 500, textDecoration: 'none' }}>Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '6px' }}>New Password</label>
                  <input style={inp} type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                  <input style={inp} type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                </div>
                {error && <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ background: '#1a1a18', color: '#fff', padding: '12px', borderRadius: '9px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
