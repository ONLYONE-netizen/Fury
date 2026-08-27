'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type HistoryItem = {
  id: string
  title: string
  content: string
  created_at: string
}

export default function HistoryPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState('hook')

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('fury_history').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setItems(data || []); setFetching(false) })
  }, [user])

  const del = async (id: string) => {
    await supabase.from('fury_history').delete().eq('id', id)
    setItems(i => i.filter(x => x.id !== id))
    if (selected === id) setSelected(null)
  }

  const getParsed = (item: HistoryItem) => {
    try { return JSON.parse(item.content) } catch { return null }
  }

  const TABS = ['hook','tweets','linkedin','blog','newsletter','summary']

  const btn: any = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '10px', fontSize: '13px', padding: '8px 16px', minHeight: '36px' }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#9a9a94' }}>Loading...</div>
  if (!user) return null

  const selectedItem = items.find(i => i.id === selected)
  const parsed = selectedItem ? getParsed(selectedItem) : null

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #e8e8e6', padding: '0 24px', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250,250,249,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '26px', height: '26px', background: '#1a1a18', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: '#1a1a18' }}>Fury</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ fontSize: '13px', color: '#9a9a94', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <button onClick={() => { signOut(); router.push('/') }} style={{ ...btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px', display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: '20px' }}>
        {/* List */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px', color: '#1a1a18' }}>History</h1>
          {fetching ? (
            <p style={{ color: '#9a9a94', fontSize: '14px' }}>Loading...</p>
          ) : items.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#4a4a46', fontWeight: 600, marginBottom: '8px' }}>No history yet</p>
              <p style={{ color: '#9a9a94', fontSize: '13px', marginBottom: '20px' }}>Your generated content will appear here.</p>
              <Link href="/dashboard" style={{ ...btn, background: '#1a1a18', color: '#fff', textDecoration: 'none', display: 'inline-flex' }}>Generate Content</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(item => (
                <div key={item.id} onClick={() => { setSelected(selected === item.id ? null : item.id); setTab('hook') }}
                  style={{ background: selected === item.id ? '#1a1a18' : '#fff', border: `1px solid ${selected === item.id ? '#1a1a18' : '#e8e8e6'}`, borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: selected === item.id ? '#fff' : '#1a1a18', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || 'Untitled'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: selected === item.id ? 'rgba(255,255,255,0.5)' : '#9a9a94', fontFamily: 'monospace' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                    <button onClick={e => { e.stopPropagation(); del(item.id) }}
                      style={{ background: 'none', border: 'none', color: selected === item.id ? 'rgba(255,255,255,0.4)' : '#9a9a94', cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && parsed && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '16px', color: '#1a1a18' }}>{selectedItem?.title || 'Untitled'}</h2>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ ...btn, background: tab === t ? '#1a1a18' : '#f5f5f3', color: tab === t ? '#fff' : '#9a9a94', border: `1px solid ${tab === t ? '#1a1a18' : '#e8e8e6'}`, padding: '6px 12px', fontSize: '12px', minHeight: '30px', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ background: '#f5f5f3', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '18px', fontSize: '14px', color: '#4a4a46', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '600px', overflowY: 'auto' }}>
              {tab === 'hook' && parsed.hook}
              {tab === 'tweets' && parsed.tweets?.join('\n\n---\n\n')}
              {tab === 'linkedin' && parsed.linkedin}
              {tab === 'blog' && parsed.blog}
              {tab === 'newsletter' && `SUBJECT: ${parsed.newsletter?.subject}\n\n${parsed.newsletter?.body}`}
              {tab === 'summary' && parsed.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
