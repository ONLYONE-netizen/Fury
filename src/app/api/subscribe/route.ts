import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY!)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fury-six.vercel.app'

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Save to Supabase
    const { error: dbErr } = await supabase.from('fury_subscribers').upsert(
      { email, source: source || 'pdf_popup', created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    if (dbErr) console.error('[Subscribe] DB error:', dbErr.message)

    // Send welcome email via Resend
    await resend.emails.send({
      from:    'Fury by Swift Lab <hello@swiftlab.dev>',
      to:      email,
      subject: '🎁 Your 50 Viral Hooks are here',
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#fafaf9;font-family:'Inter',Arial,sans-serif;color:#1a1a18}
  .wrap{max-width:560px;margin:0 auto;padding:40px 20px}
  .logo{display:flex;align-items:center;gap:8px;margin-bottom:32px}
  .logo-icon{width:28px;height:28px;background:#1a1a18;border-radius:6px;display:flex;align-items:center;justify-content:center}
  .logo-name{font-size:15px;font-weight:600;letter-spacing:-0.02em}
  .logo-by{font-size:11px;color:#9a9a94}
  .hero{background:#1a1a18;border-radius:14px;padding:32px;margin-bottom:28px;text-align:center}
  .hero-emoji{font-size:40px;margin-bottom:16px;display:block}
  .hero h1{color:#fff;font-size:22px;font-weight:600;letter-spacing:-0.02em;margin-bottom:8px;line-height:1.3}
  .hero p{color:rgba(255,255,255,0.6);font-size:14px;line-height:1.65}
  .cta-btn{display:block;background:#fff;color:#1a1a18;text-align:center;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;margin:20px auto 0;width:fit-content}
  .section{margin-bottom:24px}
  .section h2{font-size:14px;font-weight:600;margin-bottom:8px}
  .section p{font-size:13px;color:#4a4a46;line-height:1.7}
  .hooks-preview{background:#fff;border:1px solid #e8e8e6;border-radius:12px;padding:20px;margin-bottom:24px}
  .hook-item{padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:13px;color:#4a4a46;line-height:1.6}
  .hook-item:last-child{border-bottom:none;padding-bottom:0}
  .hook-num{font-weight:600;color:#1a1a18;margin-right:6px}
  .footer{text-align:center;font-size:11px;color:#b0b0aa;margin-top:32px;padding-top:20px;border-top:1px solid #e8e8e6}
</style>
</head>
<body>
<div class="wrap">
  <!-- Logo -->
  <div class="logo">
    <span style="font-size:15px;font-weight:600;letter-spacing:-0.02em">⚡ Fury</span>
    <span style="font-size:11px;color:#9a9a94">by Swift Lab</span>
  </div>

  <!-- Hero -->
  <div class="hero">
    <span class="hero-emoji">🎁</span>
    <h1>Your 50 Viral Hooks are ready</h1>
    <p>The exact hook templates top creators use to stop the scroll. Yours free — no strings attached.</p>
    <a class="cta-btn" href="${APP_URL}/viral-hooks.html">Open Your Hooks →</a>
  </div>

  <!-- Preview -->
  <div class="section">
    <h2>Here's a taste of what's inside:</h2>
  </div>
  <div class="hooks-preview">
    <div class="hook-item"><span class="hook-num">1.</span>I made $[X] in [timeframe] doing [thing most people ignore]</div>
    <div class="hook-item"><span class="hook-num">2.</span>Nobody talks about this, but [counterintuitive truth]</div>
    <div class="hook-item"><span class="hook-num">3.</span>Stop [common advice]. Do this instead.</div>
    <div class="hook-item"><span class="hook-num">4.</span>The [industry] secret that [big player] doesn't want you to know</div>
    <div class="hook-item"><span class="hook-num">5.</span>I tested [X] for [timeframe]. Here's what actually worked...</div>
    <div class="hook-item" style="text-align:center;color:#9a9a94;padding-top:12px;border-bottom:none">+ 45 more inside →</div>
  </div>

  <!-- About Fury -->
  <div class="section">
    <h2>What is Fury?</h2>
    <p>Fury turns one YouTube video into 6 pieces of content — Twitter thread, LinkedIn post, blog article, newsletter, viral hook, and summary. Free, no sign-up. Just paste a link and go.</p>
  </div>

  <div style="text-align:center;margin-top:20px">
    <a href="${APP_URL}" style="display:inline-block;background:#1a1a18;color:#fff;padding:12px 28px;border-radius:10px;font-weight:500;font-size:14px;text-decoration:none">Try Fury Free →</a>
  </div>

  <div class="footer">
    <p>Fury by Swift Lab · You're receiving this because you signed up for the free hooks PDF.</p>
  </div>
</div>
</body>
</html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Subscribe] Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
