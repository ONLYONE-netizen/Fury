'use client'
import { useState, useRef, useCallback } from 'react'

type Result = {
  hook: string
  summary: string
  tweets: string[]
  linkedin: string
  blog: string
  newsletter: { subject: string; body: string }
}

const TABS = [
  { id: 'hook', label: 'Hook' },
  { id: 'tweets', label: 'Tweets' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'blog', label: 'Blog' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'summary', label: 'Summary' },
]

const STEPS = [
  { label: 'Fetching transcript...', pct: 30 },
  { label: 'Analyzing content...', pct: 55 },
  { label: 'Writing 6 formats with Gemini...', pct: 75 },
  { label: 'Finalizing output...', pct: 90 },
]

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copying' | 'copied'>('idle')

  const copy = useCallback(async () => {
    if (state !== 'idle') return
    setState('copying')
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      setTimeout(() => setState('idle'), 2200)
    } catch {
      // Fallback for older mobile browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setState('copied')
      setTimeout(() => setState('idle'), 2200)
    }
  }, [text, state])

  return (
    <button
      className={`copy-btn ${state === 'copied' ? 'copied' : state === 'copying' ? 'copying' : ''}`}
      onClick={copy}
      disabled={state === 'copying'}
      aria-label={`Copy ${label || 'content'}`}
    >
      {state === 'copied' ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Copied
        </>
      ) : state === 'copying' ? (
        'Copying...'
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy
        </>
      )}
    </button>
  )
}

function ShareButtons({ content, type }: { content: string; type: string }) {
  const encoded = encodeURIComponent(content.slice(0, 280))
  const url = encodeURIComponent('https://fury.swiftlab.dev')

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="share-btn share-btn-x"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Post on X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="share-btn share-btn-li"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <a
        href={`https://t.me/share/url?url=${url}&text=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="share-btn share-btn-tg"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        Telegram
      </a>
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="share-btn share-btn-wa"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="skeleton" style={{ height: '20px', width: '120px' }} />
        <div className="skeleton" style={{ height: '36px', width: '80px', borderRadius: '8px' }} />
      </div>
      <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '16px' }} />
      <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '14px', width: '50%' }} />
    </div>
  )
}

export default function FuryPage() {
  const [mode, setMode] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progLabel, setProgLabel] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('hook')
  const [transcript, setTranscript] = useState('')
  const [noCaption, setNoCaption] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const stepRef = useRef(0)

  const animateProgress = useCallback(async (targetPct: number, label: string) => {
    setProgLabel(label)
    setProgress(prev => {
      if (prev < targetPct) return targetPct
      return prev
    })
  }, [])

  const run = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(5)
    setProgLabel('Starting...')
    setNoCaption(false)
    setVideoTitle('')
    setTranscript('')

    try {
      let content = ''
      let title = ''
      let author = ''
      let transcriptAvailable = false

      if (mode === 'url') {
        if (!url.trim()) { setError('Paste a YouTube link to get started.'); setLoading(false); return }

        await animateProgress(20, 'Getting video info...')

        const res = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        })
        const data = await res.json()

        if (!res.ok) { setError(data.error || 'Could not process this video. Try pasting the transcript instead.'); setLoading(false); return }

        title = data.title || ''
        author = data.author || ''
        transcriptAvailable = data.transcriptAvailable
        setVideoTitle(title)

        if (transcriptAvailable) {
          content = data.transcript
          setTranscript(data.transcript)
          await animateProgress(50, 'Transcript extracted. Writing content...')
        } else {
          setNoCaption(true)
          content = `Video: ${title} by ${author}`
          await animateProgress(50, 'No captions — generating from video context...')
        }
      } else {
        if (!text.trim()) { setError('Paste some text to repurpose.'); setLoading(false); return }
        if (text.trim().startsWith('http') && text.trim().split(' ').length < 5) {
          setError('That looks like a URL. Switch to the YouTube URL tab.')
          setLoading(false); return
        }
        if (text.trim().length < 50) { setError('Paste more content — at least a few sentences work best.'); setLoading(false); return }
        content = text.trim()
        setTranscript(text.trim())
        transcriptAvailable = true
        await animateProgress(40, 'Content ready. Writing 6 formats...')
      }

      await animateProgress(65, 'Gemini AI is writing your content...')

      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, author, transcriptAvailable }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError('Rate limit reached. Wait 60 seconds and try again.')
        } else if (res.status === 401) {
          setError('Invalid Gemini API key. Check your environment variables.')
        } else {
          setError(data.error || 'Content generation failed. Please try again.')
        }
        setLoading(false); return
      }

      await animateProgress(100, 'Done')
      setResult(data)
      setActiveTab('hook')

    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('Connection error. Check your internet and try again.')
      }
    }

    setLoading(false)
  }

  const reset = () => {
    setResult(null); setTranscript(''); setProgress(0)
    setUrl(''); setText(''); setError('')
    setNoCaption(false); setVideoTitle('')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '58px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'rgba(250,250,249,0.96)',
        backdropFilter: 'blur(16px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--text)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>Fury</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>by Swift Lab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>REPURPOSE AI</span>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '52px 20px 100px' }}>

        {/* HERO */}
        {!result && !loading && (
          <div style={{ marginBottom: '44px' }} className="fade-up">
            <h1 style={{
              fontSize: 'clamp(30px,5vw,44px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '14px',
              color: 'var(--text)',
            }}>
              One video.<br />Six pieces of content.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.75, maxWidth: '460px' }}>
              Paste a YouTube link or any text. Fury generates a tweet thread, LinkedIn post, blog article, newsletter, viral hook, and summary — instantly.
            </p>
          </div>
        )}

        {/* INPUT CARD */}
        {!result && (
          <div className="card fade-up" style={{ padding: '28px 28px 24px' }}>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
              <button
                className={`tab ${mode === 'url' ? 'active' : ''}`}
                onClick={() => { setMode('url'); setError('') }}
              >YouTube URL</button>
              <button
                className={`tab ${mode === 'text' ? 'active' : ''}`}
                onClick={() => { setMode('text'); setError('') }}
              >Paste Text</button>
            </div>

            {mode === 'url' ? (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '10px', fontWeight: 500 }}>YouTube Link</div>
                <input
                  className="inp"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && run()}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.65 }}>
                  Works with any public YouTube video. Transcript is fetched on the server — works on all devices including mobile.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--sub)', marginBottom: '10px', fontWeight: 500 }}>Text to Repurpose</div>
                <textarea
                  className="inp"
                  placeholder="Paste a transcript, article, podcast script, blog post, or any written content. The more text, the better the output..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Min. 50 characters for best results</p>
                  <p style={{ fontSize: '11px', color: text.length > 10000 ? 'var(--red)' : 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                    {text.length.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {noCaption && !loading && (
              <div className="info-box" style={{ marginTop: '16px' }}>
                No captions found for this video. Content will be generated from the video title. For best results, paste the transcript text manually.
              </div>
            )}

            {error && (
              <div className="err-box" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ marginTop: '20px' }}>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="prog-label">
                  <div className="dot-pulse" />
                  {progLabel}
                </div>
              </div>
            )}

            <button
              className="btn btn-dark btn-full"
              style={{ fontSize: '15px', marginTop: '20px', letterSpacing: '-0.01em' }}
              disabled={loading || (!url.trim() && !text.trim())}
              onClick={run}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                  Generating content...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  Generate Content
                </span>
              )}
            </button>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && progress > 60 && (
          <div className="card" style={{ padding: '28px', marginTop: '20px' }}>
            <LoadingSkeleton />
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="scale-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '4px' }}>
                  Content Ready
                </h2>
                {videoTitle ? (
                  <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '480px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {videoTitle}
                  </p>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '13px' }}>6 formats generated. Copy and publish.</p>
                )}
              </div>
              <button className="btn btn-outline" style={{ fontSize: '13px', padding: '10px 18px', minHeight: '40px' }} onClick={reset}>
                New Content
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs-row" style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* HOOK */}
            {activeTab === 'hook' && result.hook && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Viral Hook</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Use as your opening line on any platform</div>
                  </div>
                  <CopyBtn text={result.hook} label="hook" />
                </div>
                <div className="hook-block">{result.hook}</div>
                <ShareButtons content={result.hook} type="hook" />
              </div>
            )}

            {/* TWEETS */}
            {activeTab === 'tweets' && result.tweets && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>X / Twitter Thread</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>5 tweets — post as a thread for maximum reach</div>
                  </div>
                  <CopyBtn text={result.tweets.join('\n\n')} label="full thread" />
                </div>
                {result.tweets.map((tweet, i) => (
                  <div key={i} className="tweet-block fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div className="tweet-num">Tweet {i + 1} of {result.tweets.length}</div>
                      <CopyBtn text={tweet} label={`tweet ${i + 1}`} />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--sub)', lineHeight: 1.75 }}>{tweet}</p>
                    <p className={`char-count ${tweet.length > 280 ? 'char-over' : ''}`}>{tweet.length} / 280</p>
                  </div>
                ))}
                <ShareButtons content={result.tweets[0]} type="tweet" />
              </div>
            )}

            {/* LINKEDIN */}
            {activeTab === 'linkedin' && result.linkedin && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>LinkedIn Post</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>300–500 words with hashtags</div>
                  </div>
                  <CopyBtn text={result.linkedin} label="LinkedIn post" />
                </div>
                <div className="out">{result.linkedin}</div>
                <ShareButtons content={result.linkedin} type="linkedin" />
              </div>
            )}

            {/* BLOG */}
            {activeTab === 'blog' && result.blog && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>SEO Blog Article</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>600–900 words ready to publish</div>
                  </div>
                  <CopyBtn text={result.blog} label="blog article" />
                </div>
                <div className="out">{result.blog}</div>
              </div>
            )}

            {/* NEWSLETTER */}
            {activeTab === 'newsletter' && result.newsletter && (
              <div className="fade-up">
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Newsletter</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Subject Line</div>
                  <CopyBtn text={result.newsletter.subject} label="subject line" />
                </div>
                <div className="subject-box">{result.newsletter.subject}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Email Body</div>
                  <CopyBtn text={result.newsletter.body} label="newsletter body" />
                </div>
                <div className="out">{result.newsletter.body}</div>
              </div>
            )}

            {/* SUMMARY */}
            {activeTab === 'summary' && (
              <div className="fade-up">
                {result.summary && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Content Summary</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Key ideas from the source</div>
                      </div>
                      <CopyBtn text={result.summary} label="summary" />
                    </div>
                    <div className="out">{result.summary}</div>
                  </>
                )}
                {transcript && (
                  <>
                    <div className="divider" />
                    <details>
                      <summary style={{ fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none', padding: '4px 0' }}>
                        View source transcript
                      </summary>
                      <div className="out" style={{ marginTop: '12px', fontSize: '12px', maxHeight: '300px', overflowY: 'auto', color: 'var(--muted)', lineHeight: 1.7 }}>
                        {transcript}
                      </div>
                    </details>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="swift-badge">
            <div style={{ width: '18px', height: '18px', background: 'var(--text)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            Fury by Swift Lab — Your content is never stored.
          </div>
        </div>
      </footer>
    </main>
  )
}
