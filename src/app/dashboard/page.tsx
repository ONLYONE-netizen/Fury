'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

type Result = {
  hook: string; summary: string; tweets: string[]
  linkedin: string; blog: string
  newsletter: { subject: string; body: string }
  imagePrompt?: string
}

const TABS = [
  { id: 'hook', label: 'Hook' },
  { id: 'tweets', label: 'Tweets' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'blog', label: 'Blog' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'summary', label: 'Summary' },
  { id: 'image', label: 'Image' },
]

function CopyBtn({ text }: { text: string }) {
  const [state, setState] = useState<'idle'|'copied'>('idle')
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const el = document.createElement('textarea'); el.value = text
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
    }
    setState('copied'); setTimeout(() => setState('idle'), 2000)
  }
  return (
    <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${state === 'copied' ? '#bbf7d0' : '#e8e8e6'}`, background: state === 'copied' ? '#f0fdf4' : '#f5f5f3', color: state === 'copied' ? '#16a34a' : '#9a9a94', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, minHeight: '34px' }}>
      {state === 'copied' ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'url'|'text'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [progLabel, setProgLabel] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('hook')
  const [videoTitle, setVideoTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [imgLoading, setImgLoading] = useState(false)
  const [captureEmail, setCaptureEmail] = useState('')
  const [captureSubmitted, setCaptureSubmitted] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  const run = async () => {
    setBusy(true); setError(''); setResult(null)
    setProg(10); setProgLabel('Starting...')
    setVideoTitle(''); setTranscript(''); setImgUrl('')

    try {
      let content = '', title = '', author = '', transcriptAvailable = false

      if (mode === 'url') {
        if (!url.trim()) { setError('Paste a YouTube URL.'); setBusy(false); return }
        setProg(25); setProgLabel('Fetching transcript...')
        const res = await fetch('/api/transcript', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Could not process video'); setBusy(false); return }
        title = data.title || ''; author = data.author || ''
        transcriptAvailable = data.transcriptAvailable
        setVideoTitle(title)
        if (transcriptAvailable) { content = data.transcript; setTranscript(data.transcript) }
        else content = `Video: ${title} by ${author}`
      } else {
        if (!text.trim()) { setError('Paste some text.'); setBusy(false); return }
        if (text.trim().startsWith('http') && text.trim().split(' ').length < 5) {
          setError('That looks like a URL — use the YouTube URL tab.'); setBusy(false); return
        }
        content = text.trim(); setTranscript(text.trim()); transcriptAvailable = true
      }

      setProg(60); setProgLabel('Generating 6 formats with Gemini...')
      const res = await fetch('/api/repurpose', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, author, transcriptAvailable, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); setBusy(false); return }

      setProg(100); setProgLabel('Done')
      setResult(data); setTab('hook'); setShowCapture(true)
    } catch { setError('Connection error. Try again.') }
    setBusy(false)
  }

  const generateImage = async () => {
    if (!result?.imagePrompt) return
    setImgLoading(true)
    try {
      const res = await fetch('/api/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: result.imagePrompt })
      })
      const data = await res.json()
      if (data.imageUrl) setImgUrl(data.imageUrl)
      else setError('Image generation failed')
    } catch { setError('Image generation failed') }
    setImgLoading(false)
  }

  const submitEmail = async () => {
    if (!captureEmail) return
    await fetch('/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: captureEmail, source: 'post_generate' })
    })
    setCaptureSubmitted(true)
  }

  const reset = () => {
    setResult(null); setUrl(''); setText(''); setError('')
    setVideoTitle(''); setTranscript(''); setImgUrl('')
    setProg(0); setShowCapture(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#9a9a94' }}>Loading...</div>
  if (!user) return null

  const inp: any = { width: '100%', padding: '12px 16px', border: '1px solid #e8e8e6', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff', color: '#1a1a18', minHeight: '48px' }
  const btn: any = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '10px', fontSize: '14px', padding: '12px 22px', minHeight: '48px' }
  const out: any = { background: '#f5f5f3', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '18px', fontSize: '14px', color: '#4a4a46', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: 'Inter, sans-serif' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #e8e8e6', padding: '0 24px', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250,250,249,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '26px', height: '26px', background: '#1a1a18', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Fury</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/history" style={{ fontSize: '13px', color: '#9a9a94', textDecoration: 'none', fontWeight: 500 }}>History</Link>
          <button onClick={() => { signOut(); router.push('/') }} style={{ ...btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94', padding: '7px 14px', fontSize: '13px', minHeight: '34px' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {!result && !busy && (
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>One video.<br />Six pieces of content.</h1>
            <p style={{ color: '#9a9a94', fontSize: '15px', lineHeight: 1.7 }}>Paste a YouTube link or text. Fury generates all 6 formats instantly.</p>
          </div>
        )}

        {/* INPUT */}
        {!result && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '14px', padding: '28px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#f5f5f3', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
              {['url','text'].map(m => (
                <button key={m} onClick={() => { setMode(m as any); setError('') }}
                  style={{ ...btn, background: mode === m ? '#1a1a18' : 'transparent', color: mode === m ? '#fff' : '#9a9a94', padding: '7px 16px', fontSize: '13px', minHeight: '34px' }}>
                  {m === 'url' ? 'YouTube URL' : 'Paste Text'}
                </button>
              ))}
            </div>

            {mode === 'url' ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '8px' }}>YouTube Link</label>
                <input style={inp} type="url" placeholder="https://www.youtube.com/watch?v=..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} />
                <p style={{ fontSize: '12px', color: '#9a9a94', marginTop: '8px' }}>Works with any public YouTube video. Transcript extracted server-side — works on all devices.</p>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46', display: 'block', marginBottom: '8px' }}>Text to Repurpose</label>
                <textarea style={{ ...inp, minHeight: '160px', resize: 'none', lineHeight: 1.75 }} placeholder="Paste a transcript, article, podcast script, or any written content..." value={text} onChange={e => setText(e.target.value)} />
                <p style={{ fontSize: '11px', color: '#9a9a94', textAlign: 'right', marginTop: '4px', fontFamily: 'monospace' }}>{text.length.toLocaleString()} chars</p>
              </div>
            )}

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13.5px', color: '#dc2626', marginTop: '16px' }}>{error}</div>}

            {busy && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ height: '2px', background: '#e8e8e6', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', background: '#1a1a18', borderRadius: '99px', width: `${prog}%`, transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9a9a94', fontFamily: 'monospace' }}>{progLabel}</p>
              </div>
            )}

            <button style={{ ...btn, background: '#1a1a18', color: '#fff', width: '100%', marginTop: '20px', fontSize: '15px', opacity: busy ? 0.6 : 1 }}
              disabled={busy || (!url.trim() && !text.trim())} onClick={run}>
              {busy ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Content Ready</h2>
                {videoTitle && <p style={{ color: '#9a9a94', fontSize: '13px', marginTop: '2px' }}>{videoTitle}</p>}
                {!videoTitle && <p style={{ color: '#9a9a94', fontSize: '13px', marginTop: '2px' }}>6 formats generated. Copy and publish.</p>}
              </div>
              <button onClick={reset} style={{ ...btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94', padding: '8px 16px', fontSize: '13px', minHeight: '36px' }}>New Content</button>
            </div>

            {/* Email capture */}
            {showCapture && !captureSubmitted && (
              <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Get tips on growing with AI content</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '14px' }}>Weekly insights. No spam. Unsubscribe anytime.</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input style={{ ...inp, flex: 1, minWidth: '180px', minHeight: '38px', padding: '8px 12px', fontSize: '13px' }} type="email" placeholder="your@email.com" value={captureEmail} onChange={e => setCaptureEmail(e.target.value)} />
                  <button onClick={submitEmail} style={{ ...btn, background: '#fff', color: '#1a1a18', padding: '8px 18px', fontSize: '13px', minHeight: '38px', fontWeight: 600 }}>Subscribe</button>
                  <button onClick={() => setShowCapture(false)} style={{ ...btn, background: 'transparent', color: 'rgba(255,255,255,0.4)', padding: '8px', fontSize: '12px', minHeight: '38px' }}>×</button>
                </div>
              </div>
            )}
            {captureSubmitted && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#16a34a' }}>
                You are subscribed. Welcome to the Swift Lab community.
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ ...btn, background: tab === t.id ? '#1a1a18' : '#f5f5f3', color: tab === t.id ? '#fff' : '#9a9a94', border: `1px solid ${tab === t.id ? '#1a1a18' : '#e8e8e6'}`, padding: '7px 14px', fontSize: '13px', minHeight: '34px' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'hook' && result.hook && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '14px' }}>Viral Hook</p><p style={{ fontSize: '12px', color: '#9a9a94' }}>Use as opening line on any platform</p></div>
                  <CopyBtn text={result.hook} />
                </div>
                <div style={{ borderLeft: '3px solid #1a1a18', padding: '16px 20px', background: 'rgba(26,26,24,0.04)', borderRadius: '0 10px 10px 0', fontSize: '18px', fontWeight: 500, color: '#1a1a18', lineHeight: 1.5, fontStyle: 'italic' }}>{result.hook}</div>
              </div>
            )}

            {tab === 'tweets' && result.tweets && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '14px' }}>X / Twitter Thread</p><p style={{ fontSize: '12px', color: '#9a9a94' }}>5 tweets — post as a thread</p></div>
                  <CopyBtn text={result.tweets.join('\n\n')} />
                </div>
                {result.tweets.map((tw, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tweet {i + 1}</span>
                      <CopyBtn text={tw} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#4a4a46', lineHeight: 1.75 }}>{tw}</p>
                    <p style={{ fontSize: '11px', color: tw.length > 280 ? '#dc2626' : '#9a9a94', fontFamily: 'monospace', textAlign: 'right', marginTop: '8px' }}>{tw.length}/280</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'linkedin' && result.linkedin && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '14px' }}>LinkedIn Post</p><p style={{ fontSize: '12px', color: '#9a9a94' }}>300–500 words with hashtags</p></div>
                  <CopyBtn text={result.linkedin} />
                </div>
                <div style={out}>{result.linkedin}</div>
              </div>
            )}

            {tab === 'blog' && result.blog && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '14px' }}>SEO Blog Article</p><p style={{ fontSize: '12px', color: '#9a9a94' }}>600–900 words ready to publish</p></div>
                  <CopyBtn text={result.blog} />
                </div>
                <div style={out}>{result.blog}</div>
              </div>
            )}

            {tab === 'newsletter' && result.newsletter && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46' }}>Subject Line</p>
                  <CopyBtn text={result.newsletter.subject} />
                </div>
                <div style={{ ...out, fontSize: '15px', fontWeight: 500, color: '#1a1a18', marginBottom: '16px' }}>{result.newsletter.subject}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#4a4a46' }}>Email Body</p>
                  <CopyBtn text={result.newsletter.body} />
                </div>
                <div style={out}>{result.newsletter.body}</div>
              </div>
            )}

            {tab === 'summary' && result.summary && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div><p style={{ fontWeight: 600, fontSize: '14px' }}>Content Summary</p><p style={{ fontSize: '12px', color: '#9a9a94' }}>Key ideas from the source</p></div>
                  <CopyBtn text={result.summary} />
                </div>
                <div style={out}>{result.summary}</div>
                {transcript && (
                  <details style={{ marginTop: '20px' }}>
                    <summary style={{ fontSize: '12px', color: '#9a9a94', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none' }}>View source transcript</summary>
                    <div style={{ ...out, marginTop: '12px', fontSize: '12px', maxHeight: '260px', overflowY: 'auto', color: '#9a9a94' }}>{transcript}</div>
                  </details>
                )}
              </div>
            )}

            {tab === 'image' && (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>AI Cover Image</p>
                <p style={{ fontSize: '13px', color: '#9a9a94', marginBottom: '20px' }}>Generated from your content. Use as blog header, social cover, or newsletter image. Free — powered by Flux AI.</p>
                {!imgUrl ? (
                  <button onClick={generateImage} disabled={imgLoading}
                    style={{ ...btn, background: '#1a1a18', color: '#fff', width: '100%', opacity: imgLoading ? 0.6 : 1 }}>
                    {imgLoading ? 'Generating image...' : 'Generate Cover Image'}
                  </button>
                ) : (
                  <div>
                    <img src={imgUrl} alt="Generated cover" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e8e8e6', display: 'block', marginBottom: '12px' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a href={imgUrl} download target="_blank" rel="noopener noreferrer"
                        style={{ ...btn, background: '#1a1a18', color: '#fff', flex: 1, textDecoration: 'none', fontSize: '13px', minHeight: '40px' }}>Download Image</a>
                      <button onClick={() => setImgUrl('')}
                        style={{ ...btn, background: 'transparent', border: '1px solid #e8e8e6', color: '#9a9a94', fontSize: '13px', minHeight: '40px' }}>Regenerate</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #e8e8e6', padding: '20px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9a9a94', maxWidth: '760px', margin: '0 auto' }}>
          Fury by Swift Lab — Powered by Gemini 1.5 Flash + Flux AI
        </p>
      </footer>
    </div>
  )
}
