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

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
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

  const run = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(10)
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
        if (!url.trim()) { setError('Paste a YouTube URL first.'); setLoading(false); return }

        setProgress(25)
        setProgLabel('Fetching transcript from YouTube...')

        const res = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        })
        const data = await res.json()

        if (!res.ok) { setError(data.error || 'Failed to process video'); setLoading(false); return }

        title = data.title || ''
        author = data.author || ''
        transcriptAvailable = data.transcriptAvailable
        setVideoTitle(title)

        if (transcriptAvailable) {
          content = data.transcript
          setTranscript(data.transcript)
          setProgress(55)
          setProgLabel('Transcript extracted. Generating content...')
        } else {
          setNoCaption(true)
          content = `Video title: ${title}. Creator: ${author}`
          setProgress(55)
          setProgLabel('No captions found. Generating from video context...')
        }

      } else {
        if (!text.trim()) { setError('Paste some text to repurpose.'); setLoading(false); return }
        if (text.trim().startsWith('http') && text.trim().split(' ').length < 5) {
          setError('That looks like a URL. Use the YouTube URL tab instead.')
          setLoading(false); return
        }
        if (text.trim().length < 50) { setError('Paste more content — at least a few sentences.'); setLoading(false); return }
        content = text.trim()
        setTranscript(text.trim())
        transcriptAvailable = true
        setProgress(40)
        setProgLabel('Generating content...')
      }

      setProgress(65)
      setProgLabel('Swift Lab AI is writing 6 formats...')

      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, author, transcriptAvailable }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Content generation failed')
        setLoading(false); return
      }

      setProgress(100)
      setProgLabel('Done')
      setResult(data)
      setActiveTab('hook')

    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
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
        height: '56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '780px',
        margin: '0 auto',
        position: 'sticky',
        top: 0,
        background: 'rgba(250,250,249,0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
      }}>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>Fury</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.1em' }}>by Swift Lab</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Repurpose AI</span>
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* HERO */}
        {!result && !loading && (
          <div style={{ marginBottom: '40px' }} className="fade-up">
            <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px', color: 'var(--text)' }}>
              One video.<br />Six pieces of content.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, maxWidth: '460px' }}>
              Paste a YouTube link or text. Fury extracts the transcript and generates tweets, a LinkedIn post, a blog article, a newsletter, and more — instantly.
            </p>
          </div>
        )}

        {/* INPUT */}
        {!result && (
          <div className="card fade-up" style={{ padding: '28px' }}>
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
              <button className={`tab ${mode === 'url' ? 'active' : ''}`} onClick={() => { setMode('url'); setError('') }}>YouTube URL</button>
              <button className={`tab ${mode === 'text' ? 'active' : ''}`} onClick={() => { setMode('text'); setError('') }}>Paste Text</button>
            </div>

            {mode === 'url' ? (
              <div>
                <label className="label">YouTube Link</label>
                <input
                  className="inp"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && run()}
                />
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                  Paste any public YouTube video link. Fury extracts the transcript server-side — works on all devices.
                </p>
              </div>
            ) : (
              <div>
                <label className="label">Text to Repurpose</label>
                <textarea
                  className="inp"
                  placeholder="Paste a transcript, article, podcast script, blog post, or any written content here. The more content, the better the output..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', textAlign: 'right', marginTop: '6px' }}>
                  {text.length.toLocaleString()} characters
                </p>
              </div>
            )}

            {noCaption && !loading && (
              <div className="info-box" style={{ marginTop: '16px' }}>
                No captions found for this video. Content generated from the video title and context. For best results, paste the transcript manually using the Paste Text tab.
              </div>
            )}

            {error && <div className="err-box" style={{ marginTop: '16px' }}>{error}</div>}

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
              style={{ fontSize: '15px', padding: '13px', marginTop: '20px' }}
              disabled={loading || (!url.trim() && !text.trim())}
              onClick={run}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="spin" style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                  Generating...
                </span>
              ) : 'Generate Content'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>Content Ready</h2>
                {videoTitle && <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '3px' }}>{videoTitle}</p>}
                {!videoTitle && <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '3px' }}>6 formats generated. Copy and publish.</p>}
              </div>
              <button className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={reset}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="label" style={{ margin: 0 }}>Viral Hook</label>
                  <CopyBtn text={result.hook} />
                </div>
                <div className="hook-block">{result.hook}</div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
                  Use this as your opening line on X, LinkedIn, Instagram, or as your email subject line.
                </p>
              </div>
            )}

            {/* TWEETS */}
            {activeTab === 'tweets' && result.tweets && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className="label" style={{ margin: 0 }}>X / Twitter Thread — 5 Tweets</label>
                  <CopyBtn text={result.tweets.join('\n\n')} />
                </div>
                {result.tweets.map((tweet, i) => (
                  <div key={i} className="tweet-block fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="tweet-num">Tweet {i + 1} of {result.tweets.length}</div>
                      <CopyBtn text={tweet} />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--sub)', lineHeight: 1.75 }}>{tweet}</p>
                    <p className={`char-count ${tweet.length > 280 ? 'char-over' : ''}`}>{tweet.length}/280</p>
                  </div>
                ))}
              </div>
            )}

            {/* LINKEDIN */}
            {activeTab === 'linkedin' && result.linkedin && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="label" style={{ margin: 0 }}>LinkedIn Post</label>
                  <CopyBtn text={result.linkedin} />
                </div>
                <div className="out">{result.linkedin}</div>
              </div>
            )}

            {/* BLOG */}
            {activeTab === 'blog' && result.blog && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="label" style={{ margin: 0 }}>SEO Blog Article</label>
                  <CopyBtn text={result.blog} />
                </div>
                <div className="out">{result.blog}</div>
              </div>
            )}

            {/* NEWSLETTER */}
            {activeTab === 'newsletter' && result.newsletter && (
              <div className="fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="label" style={{ margin: 0 }}>Subject Line</label>
                  <CopyBtn text={result.newsletter.subject} />
                </div>
                <div className="subject-box">{result.newsletter.subject}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="label" style={{ margin: 0 }}>Newsletter Body</label>
                  <CopyBtn text={result.newsletter.body} />
                </div>
                <div className="out">{result.newsletter.body}</div>
              </div>
            )}

            {/* SUMMARY */}
            {activeTab === 'summary' && (
              <div className="fade-up">
                {result.summary && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label className="label" style={{ margin: 0 }}>Content Summary</label>
                      <CopyBtn text={result.summary} />
                    </div>
                    <div className="out">{result.summary}</div>
                  </>
                )}
                {transcript && (
                  <>
                    <div className="divider" />
                    <details>
                      <summary style={{ fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none' }}>
                        View Source Transcript
                      </summary>
                      <div className="out" style={{ marginTop: '12px', fontSize: '12px', maxHeight: '280px', overflowY: 'auto', color: 'var(--muted)' }}>
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
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', marginTop: '40px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Fury by Swift Lab — Your content is never stored.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Powered by Swift Lab
          </p>
        </div>
      </footer>
    </main>
  )
}
