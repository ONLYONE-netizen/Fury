'use client'
import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { getHistory, saveToHistory, deleteFromHistory, type HistoryItem } from '@/lib/history'

type Result = {
  hook: string; summary: string; tweets: string[]
  linkedin: string; blog: string
  newsletter: { subject: string; body: string }
  imagePrompt?: string
}

const TABS = ['Hook','Tweets','LinkedIn','Blog','Newsletter','Summary']
const TOOLS = [
  { id: 'image',   icon: 'image', name: 'AI Cover Image',     active: true  },
  { id: 'clip',    icon: 'scissors', name: 'Clip Generator',      active: false },
  { id: 'youtube', icon: 'bot', name: 'YouTube Automation',  active: false },
  { id: 'weekly',  icon: 'calendar', name: 'Weekly Content Plan', active: false },
]

function ToolIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#1a1a18" : "#b0b0aa"
  const paths: Record<string, ReactNode> = {
    image: <><rect x="3" y="3" width="14" height="14" rx="2"/><circle cx="7.5" cy="7.5" r="1.5"/><path d="M17 13l-4.5-4.5a1 1 0 0 0-1.4 0L4 16"/></>,
    scissors: <><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="14" r="2.2"/><path d="M8 7.5L17 15M8 12.5L17 5"/></>,
    bot: <><rect x="4" y="7" width="12" height="9" rx="2"/><path d="M10 3v4M7 11v1M13 11v1"/><path d="M2 10h2M16 10h2"/></>,
    calendar: <><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v3M13 2v3"/></>,
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "20px", height: "20px", borderRadius: "6px",
      background: "#fff", border: "1px solid #e8e8e6",
      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.03)",
    }}>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const el = document.createElement('textarea'); el.value = text
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
    }
    setDone(true); setTimeout(() => setDone(false), 2000)
  }
  return (
    <button onClick={copy} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${done ? '#bbf7d0' : '#e8e8e6'}`, background: done ? '#f0fdf4' : '#f5f5f3', color: done ? '#16a34a' : '#9a9a94', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function FuryApp() {
  const [mode, setMode]           = useState<'url'|'text'>('url')
  const [url, setUrl]             = useState('')
  const [text, setText]           = useState('')
  const [busy, setBusy]           = useState(false)
  const [prog, setProg]           = useState(0)
  const [progLabel, setProgLabel] = useState('')
  const [result, setResult]       = useState<Result | null>(null)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState('Hook')
  const [videoTitle, setVideoTitle] = useState('')
  const [imgUrl, setImgUrl]       = useState('')
  const [imgLoading, setImgLoading] = useState(false)
  const [imgError, setImgError]   = useState('')
  const [showImage, setShowImage] = useState(false)
  const [history, setHistory]     = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [banner, setBanner]       = useState(false)
  const [bannerEmail, setBannerEmail] = useState('')
  const [bannerDone, setBannerDone]   = useState(false)

  // Load history and show banner after 8s
  useEffect(() => {
    setHistory(getHistory())
    const t = setTimeout(() => {
      const dismissed = localStorage.getItem('fury_banner_dismissed')
      if (!dismissed) setBanner(true)
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const dismissBanner = () => {
    setBanner(false)
    localStorage.setItem('fury_banner_dismissed', '1')
  }

  const submitBannerEmail = async () => {
    if (!bannerEmail) return
    await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: bannerEmail, source: 'pdf_popup' }) })
    setBannerDone(true)
    setTimeout(dismissBanner, 2500)
  }

  const run = async () => {
    setBusy(true); setError(''); setResult(null); setProg(10); setProgLabel('Starting...')
    setVideoTitle(''); setImgUrl(''); setShowImage(false)
    try {
      let content = '', title = '', author = '', transcriptAvailable = false

      if (mode === 'url') {
        if (!url.trim()) { setError('Paste a YouTube URL.'); setBusy(false); return }
        setProg(25); setProgLabel('Fetching transcript...')
        const res  = await fetch('/api/transcript', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Could not process video'); setBusy(false); return }
        title = data.title || ''; author = data.author || ''
        transcriptAvailable = data.transcriptAvailable
        setVideoTitle(title)
        content = transcriptAvailable ? data.transcript : `Video: ${title} by ${author}`
      } else {
        if (!text.trim()) { setError('Paste some text.'); setBusy(false); return }
        content = text.trim(); transcriptAvailable = true
      }

      setProg(60); setProgLabel('Fury AI is writing your content...')
      const res  = await fetch('/api/repurpose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, title, author }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); setBusy(false); return }

      setProg(100); setProgLabel('Done')
      setResult(data); setTab('Hook')

      // Save to localStorage history
      saveToHistory({ title: title || text.slice(0, 60) || 'Untitled', content: JSON.stringify(data) })
      setHistory(getHistory())

    } catch { setError('Connection error. Try again.') }
    setBusy(false)
  }

  const generateImage = async () => {
    const prompt = result?.imagePrompt || result?.hook || videoTitle
    if (!prompt) return
    setImgLoading(true)
    setImgError('')
    try {
      const res  = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      if (data.imageUrl) {
        setImgUrl(data.imageUrl)
      } else {
        setImgError(data.error || 'Image generation failed. Try again.')
      }
    } catch {
      setImgError('Could not reach the image service. Try again.')
    }
    setImgLoading(false)
  }

  const loadFromHistory = (item: HistoryItem) => {
    try {
      const parsed = JSON.parse(item.content)
      setResult(parsed); setTab('Hook'); setVideoTitle(item.title)
      setShowHistory(false)
    } catch {}
  }

  const reset = () => { setResult(null); setUrl(''); setText(''); setError(''); setVideoTitle(''); setImgUrl(''); setImgError(''); setProg(0); setShowImage(false) }

  const S = {
    inp: { width: '100%', padding: '12px 16px', border: '1px solid #e8e8e6', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1a1a18' } as React.CSSProperties,
    btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '10px', fontSize: '14px', padding: '12px 20px' } as React.CSSProperties,
    out: { background: '#f5f5f3', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '18px', fontSize: '14px', color: '#4a4a46', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } as React.CSSProperties,
  }

  const getTabContent = () => {
    if (!result) return null
    if (tab === 'Hook')       return <div style={{ ...S.out, fontSize: '18px', fontWeight: 500, fontStyle: 'italic', borderLeft: '3px solid #1a1a18', borderRadius: '0 10px 10px 0', paddingLeft: '20px' }}>{result.hook}</div>
    if (tab === 'Tweets')     return <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{result.tweets?.map((tw, i) => <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '14px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '10px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tweet {i+1}</span><CopyBtn text={tw} /></div><p style={{ fontSize: '14px', color: '#4a4a46', lineHeight: 1.75 }}>{tw}</p><p style={{ fontSize: '11px', color: tw.length > 280 ? '#dc2626' : '#9a9a94', fontFamily: 'monospace', textAlign: 'right', marginTop: '6px' }}>{tw.length}/280</p></div>)}</div>
    if (tab === 'LinkedIn')   return <div style={S.out}>{result.linkedin}</div>
    if (tab === 'Blog')       return <div style={S.out}>{result.blog}</div>
    if (tab === 'Newsletter') return <div><div style={{ ...S.out, fontSize: '15px', fontWeight: 500, marginBottom: '12px' }}>{result.newsletter?.subject}</div><div style={S.out}>{result.newsletter?.body}</div></div>
    if (tab === 'Summary')    return <div style={S.out}>{result.summary}</div>
    return null
  }

  const currentTabText = () => {
    if (!result) return ''
    if (tab === 'Hook')       return result.hook
    if (tab === 'Tweets')     return result.tweets?.join('\n\n')
    if (tab === 'LinkedIn')   return result.linkedin
    if (tab === 'Blog')       return result.blog
    if (tab === 'Newsletter') return `${result.newsletter?.subject}\n\n${result.newsletter?.body}`
    if (tab === 'Summary')    return result.summary
    return ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: 'Inter, sans-serif' }}>

      {/* EMAIL CAPTURE BANNER */}
      {banner && (
        <div className="slide-up" style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#1a1a18', color: '#fff', borderRadius: '14px', padding: '20px', width: '272px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          <button onClick={dismissBanner} style={{ position: 'absolute', top: '10px', right: '14px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          {bannerDone ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Check your inbox!</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>Your 50 Viral Hooks PDF is on its way.</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🎁</div>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Free PDF — 50 Viral Hooks</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '14px', lineHeight: 1.55 }}>The exact hooks top creators use to stop the scroll. Drop your email and get it free.</p>
              <input style={{ ...S.inp, marginBottom: '8px', minHeight: '38px', padding: '8px 12px', fontSize: '13px' }} type="email" placeholder="your@email.com" value={bannerEmail} onChange={e => setBannerEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitBannerEmail()} />
              <button onClick={submitBannerEmail} style={{ ...S.btn, width: '100%', background: '#fff', color: '#1a1a18', fontWeight: 600, padding: '9px', fontSize: '13px' }}>Send Me the PDF →</button>
              <p onClick={dismissBanner} style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '10px', cursor: 'pointer' }}>No thanks</p>
            </>
          )}
        </div>
      )}

      {/* HISTORY DRAWER */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
          <div style={{ width: '320px', background: '#fff', height: '100%', padding: '24px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>History</p>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#9a9a94', cursor: 'pointer' }}>×</button>
            </div>
            {history.length === 0 ? (
              <p style={{ color: '#9a9a94', fontSize: '13px' }}>No history yet. Generate your first content.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(h => (
                  <div key={h.id} style={{ background: '#fafaf9', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '12px 14px', cursor: 'pointer' }} onClick={() => loadFromHistory(h)}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a18', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#9a9a94' }}>{new Date(h.createdAt).toLocaleDateString()}</p>
                      <button onClick={e => { e.stopPropagation(); deleteFromHistory(h.id); setHistory(getHistory()) }} style={{ background: 'none', border: 'none', color: '#9a9a94', fontSize: '11px', cursor: 'pointer', padding: '2px 6px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #e8e8e6', padding: '0 20px', height: '54px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250,250,249,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', background: '#1a1a18', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Fury</span>
          <span style={{ fontSize: '11px', color: '#b0b0aa', fontFamily: 'monospace' }}>by Swift Lab</span>
        </div>
        <button onClick={() => setShowHistory(true)} style={{ ...S.btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94', padding: '7px 14px', fontSize: '13px' }}>
          History {history.length > 0 && <span style={{ background: '#1a1a18', color: '#fff', borderRadius: '99px', padding: '1px 6px', fontSize: '10px', fontFamily: 'monospace' }}>{history.length}</span>}
        </button>
      </nav>

      {/* MAIN */}
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* HERO */}
        {!result && !busy && (
          <div style={{ marginBottom: '28px' }} className="fade-in">
            <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>One video.<br/>Six pieces of content.</h1>
            <p style={{ color: '#9a9a94', fontSize: '15px', lineHeight: 1.7 }}>Paste a YouTube link or text. Fury generates everything instantly. Free, no sign-up.</p>
          </div>
        )}

        {/* INPUT */}
        {!result && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', background: '#f5f5f3', borderRadius: '10px', padding: '3px', width: 'fit-content' }}>
              {['url','text'].map(m => (
                <button key={m} onClick={() => { setMode(m as any); setError('') }} style={{ ...S.btn, background: mode === m ? '#1a1a18' : 'transparent', color: mode === m ? '#fff' : '#9a9a94', padding: '6px 16px', fontSize: '13px' }}>
                  {m === 'url' ? 'YouTube URL' : 'Paste Text'}
                </button>
              ))}
            </div>

            {mode === 'url' ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '7px' }}>YouTube Link</label>
                <input style={S.inp} type="url" placeholder="https://www.youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} />
                <p style={{ fontSize: '11px', color: '#b0b0aa', marginTop: '6px' }}>Works with any public YouTube video.</p>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '7px' }}>Text to Repurpose</label>
                <textarea style={{ ...S.inp, minHeight: '140px', resize: 'none', lineHeight: 1.75 }} placeholder="Paste a transcript, article, or any written content..." value={text} onChange={e => setText(e.target.value)} />
                <p style={{ fontSize: '11px', color: '#b0b0aa', textAlign: 'right', marginTop: '4px', fontFamily: 'monospace' }}>{text.length.toLocaleString()} chars</p>
              </div>
            )}

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#dc2626', marginTop: '14px' }}>{error}</div>}

            {busy && (
              <div style={{ marginTop: '18px' }}>
                <div style={{ height: '2px', background: '#e8e8e6', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', background: '#1a1a18', borderRadius: '99px', width: `${prog}%`, transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9a9a94', fontFamily: 'monospace' }}>{progLabel}</p>
              </div>
            )}

            <button style={{ ...S.btn, background: '#1a1a18', color: '#fff', width: '100%', marginTop: '16px', fontSize: '15px', opacity: busy || (!url.trim() && !text.trim()) ? 0.6 : 1 }}
              disabled={busy || (!url.trim() && !text.trim())} onClick={run}>
              {busy ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>Content Ready</h2>
                {videoTitle && <p style={{ color: '#9a9a94', fontSize: '12px', marginTop: '2px' }}>{videoTitle}</p>}
              </div>
              <button onClick={reset}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a18'; (e.currentTarget as HTMLElement).style.color = '#1a1a18'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e6'; (e.currentTarget as HTMLElement).style.color = '#4a4a46'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
                style={{ ...S.btn, background: '#fff', border: '1px solid #e8e8e6', color: '#4a4a46', padding: '7px 14px', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s' }}>New Content</button>
            </div>

            {/* Format tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ ...S.btn, background: tab === t ? '#1a1a18' : '#f5f5f3', color: tab === t ? '#fff' : '#9a9a94', border: `1px solid ${tab === t ? '#1a1a18' : '#e8e8e6'}`, padding: '7px 14px', fontSize: '13px' }}>{t}</button>
              ))}
            </div>

            {/* Tab header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46' }}>{tab === 'Newsletter' ? 'Subject + Body' : tab}</p>
              <CopyBtn text={currentTabText() || ''} />
            </div>

            {/* Tab content */}
            {getTabContent()}

            {/* AI Image section */}
            <div style={{ marginTop: '20px', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: imgUrl ? '14px' : '0' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '13px' }}>AI Cover Image</p>
                  <p style={{ fontSize: '11px', color: '#9a9a94', marginTop: '2px' }}>Image generation for your content powered by Fury</p>
                </div>
                {!imgUrl && (
                  <button onClick={generateImage} disabled={imgLoading} style={{ ...S.btn, background: '#1a1a18', color: '#fff', padding: '8px 16px', fontSize: '13px', opacity: imgLoading ? 0.6 : 1 }}>
                    {imgLoading ? 'Generating...' : 'Generate Image'}
                  </button>
                )}
              </div>
              {imgError && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '10px' }}>{imgError}</p>}
              {imgUrl && (
                <div>
                  <img src={imgUrl} alt="Generated cover" style={{ width: '100%', borderRadius: '8px', display: 'block', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={imgUrl} download target="_blank" rel="noopener noreferrer" style={{ ...S.btn, background: '#1a1a18', color: '#fff', flex: 1, textDecoration: 'none', padding: '9px', fontSize: '13px' }}>Download</a>
                    <button onClick={() => setImgUrl('')} style={{ ...S.btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94', padding: '9px 16px', fontSize: '13px' }}>Regenerate</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI TOOLS STORE */}
        <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '1px solid #e8e8e6' }}>
          <p style={{ fontSize: '11px', color: '#9a9a94', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, fontFamily: 'monospace', marginBottom: '12px' }}>AI Tools by Swift Lab</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TOOLS.map(tool => (
              <div key={tool.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '99px', border: '1px solid #e8e8e6', background: '#fff', cursor: tool.active ? 'pointer' : 'default', opacity: tool.active ? 1 : 0.45, position: 'relative', overflow: 'hidden', transition: 'all 0.15s' }}
                onMouseEnter={e => tool.active && ((e.currentTarget as HTMLElement).style.borderColor = '#1a1a18')}
                onMouseLeave={e => tool.active && ((e.currentTarget as HTMLElement).style.borderColor = '#e8e8e6')}>
                <ToolIcon name={tool.icon} active={tool.active} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a1a18', whiteSpace: 'nowrap' }}>{tool.name}</span>
                {tool.active
                  ? <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '99px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New</span>
                  : <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '99px', background: '#f5f5f3', color: '#b0b0aa', border: '1px solid #e8e8e6', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Soon</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e8e8e6', padding: '16px 20px' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#b0b0aa' }}>Fury by Swift Lab</p>
      </footer>
    </div>
  )
}
