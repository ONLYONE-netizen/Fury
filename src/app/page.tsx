import Link from 'next/link'

const FEATURES = [
  ['Twitter/X Thread', '5 tweets ready to post as a thread. Each under 280 characters.'],
  ['LinkedIn Post', '300-500 words with hashtags. Optimized for professional reach.'],
  ['SEO Blog Article', '600-900 words with H1 and H2 sections. Ready to publish.'],
  ['Email Newsletter', 'Subject line + full body. Conversational and conversion-focused.'],
  ['Viral Hook', 'One sentence that stops the scroll. Works on every platform.'],
  ['Content Summary', 'Key ideas extracted and distilled. Save hours of note-taking.'],
]

const STEPS = [
  ['01', 'Paste a YouTube link or any text', 'Drop in a video URL or paste a transcript, article, or podcast notes.'],
  ['02', 'Fury extracts and analyzes', 'The transcript is pulled automatically. AI reads and understands the full content.'],
  ['03', 'Six formats generated instantly', 'Tweet thread, LinkedIn post, blog article, newsletter, hook, and summary — all at once.'],
]

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fafaf9', color: '#1a1a18', fontFamily: 'Inter, sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #e8e8e6', padding: '0 24px', height: '58px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(250,250,249,0.96)', backdropFilter: 'blur(16px)', zIndex: 10, maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1a1a18', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Fury</span>
          <span style={{ fontSize: '11px', color: '#9a9a94', fontFamily: 'monospace', letterSpacing: '0.05em' }}>by Swift Lab</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#9a9a94', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          <Link href="/signup" style={{ background: '#1a1a18', color: '#fff', padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Try Fury Free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* HERO */}
        <section style={{ paddingTop: '96px', paddingBottom: '80px', maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f0ee', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', color: '#4a4a46', fontWeight: 500, marginBottom: '32px' }}>
            <span style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Free to start — no credit card
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', color: '#1a1a18' }}>
            Stop paying for editors.<br />
            Stop losing sleep<br />
            over content.
          </h1>

          <p style={{ fontSize: '18px', color: '#4a4a46', lineHeight: 1.75, marginBottom: '36px', maxWidth: '540px' }}>
            One video or link in. Six pieces of content out — Twitter thread, LinkedIn post, blog article, newsletter, and more. In seconds.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ background: '#1a1a18', color: '#fff', padding: '14px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Try Fury Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/login" style={{ background: 'transparent', color: '#4a4a46', padding: '14px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', border: '1px solid #e8e8e6' }}>
              I have an account
            </Link>
          </div>

          <p style={{ fontSize: '12px', color: '#9a9a94', marginTop: '16px' }}>
            No credit card. No setup. Generate your first content in 30 seconds.
          </p>
        </section>

        {/* DEMO VISUAL */}
        <section style={{ paddingBottom: '80px' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Mock browser bar */}
            <div style={{ background: '#f5f5f3', borderBottom: '1px solid #e8e8e6', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: '#e8e8e6', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', color: '#9a9a94', fontFamily: 'monospace', maxWidth: '300px', margin: '0 auto' }}>
                fury.swiftlab.dev
              </div>
            </div>
            {/* Mock content */}
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fafaf9', borderRadius: '10px', padding: '20px', border: '1px solid #e8e8e6' }}>
                <div style={{ fontSize: '11px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Input</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', padding: '10px 14px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9a94" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                  <span style={{ fontSize: '13px', color: '#4a4a46' }}>youtube.com/watch?v=...</span>
                </div>
                <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '20px', color: '#d4d4d0' }}>↓</div>
                <div style={{ fontSize: '11px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Generating...</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Hook','Tweets','LinkedIn','Blog','Newsletter','Summary'].map((f, i) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 1 - i * 0.1 }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                      </div>
                      <span style={{ fontSize: '12px', color: '#4a4a46' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['Hook', 'This creator made $2M without showing his face — and here\'s exactly how he did it.'],
                  ['Tweet 1', 'Most creators think followers = income. Wrong. This channel proved that 100K engaged subscribers beat 10M passive ones every time.'],
                  ['LinkedIn', 'I analyzed 50 faceless YouTube channels this month and found something nobody talks about...'],
                ].map(([label, text]) => (
                  <div key={label} style={{ background: '#fafaf9', border: '1px solid #e8e8e6', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '9px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{label}</div>
                    <p style={{ fontSize: '12px', color: '#4a4a46', lineHeight: 1.6 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ paddingBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '48px', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
            {STEPS.map(([num, title, desc]) => (
              <div key={num} style={{ padding: '32px', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '14px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9a9a94', marginBottom: '16px', letterSpacing: '0.05em' }}>{num}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#4a4a46', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ paddingBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '12px', textAlign: 'center' }}>Six formats. One click.</h2>
          <p style={{ textAlign: 'center', color: '#9a9a94', fontSize: '15px', marginBottom: '48px' }}>Everything you need to repurpose a single piece of content across every platform.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {FEATURES.map(([title, desc]) => (
              <div key={title} style={{ padding: '24px', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '12px' }}>
                <div style={{ width: '6px', height: '6px', background: '#1a1a18', borderRadius: '50%', marginBottom: '14px' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#9a9a94', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section style={{ paddingBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '48px', textAlign: 'center' }}>Simple pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', maxWidth: '640px', margin: '0 auto' }}>
            {/* Free */}
            <div style={{ padding: '36px', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9a9a94', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Free</div>
              <div style={{ fontSize: '42px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '4px' }}>$0</div>
              <div style={{ fontSize: '13px', color: '#9a9a94', marginBottom: '28px' }}>forever</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['5 repurposes per day', 'All 6 formats', 'YouTube + text input', 'Content history (7 days)'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#4a4a46', alignItems: 'flex-start' }}>
                    <span style={{ color: '#1a1a18', flexShrink: 0, marginTop: '2px' }}>—</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '9px', border: '1px solid #e8e8e6', color: '#4a4a46', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                Try Fury Free
              </Link>
            </div>
            {/* Pro */}
            <div style={{ padding: '36px', background: '#1a1a18', border: '1px solid #1a1a18', borderRadius: '16px', color: '#fff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#fff', color: '#1a1a18', fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Popular</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Pro</div>
              <div style={{ fontSize: '42px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '4px' }}>₦3,000</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>per month</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['Unlimited repurposes', 'All 6 formats', 'AI cover image generation', 'Full content history', 'Priority generation', 'Early access to new features'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: 'rgba(255,255,255,0.8)', alignItems: 'flex-start' }}>
                    <span style={{ color: '#fff', flexShrink: 0, marginTop: '2px' }}>+</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '9px', background: '#fff', color: '#1a1a18', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                Get Pro
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBottom: '96px' }}>
          <div style={{ background: '#1a1a18', borderRadius: '20px', padding: '64px 40px', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Your next 6 posts are<br />30 seconds away.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginBottom: '36px', maxWidth: '440px', margin: '0 auto 36px' }}>
              Stop spending hours writing content. Paste one link and let Fury do the work.
            </p>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#1a1a18', padding: '14px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
              Try Fury Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e8e8e6', padding: '24px', background: '#fafaf9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#1a1a18', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Fury</span>
            <span style={{ fontSize: '11px', color: '#9a9a94' }}>by Swift Lab</span>
          </div>
          <p style={{ fontSize: '12px', color: '#9a9a94' }}>Your content is never stored without your permission.</p>
          <p style={{ fontSize: '12px', color: '#9a9a94' }}>© 2026 Swift Lab</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @media(max-width:640px) {
          nav { padding: 0 16px; }
          section { padding-left: 0 !important; padding-right: 0 !important; }
        }
      `}</style>
    </main>
  )
}
