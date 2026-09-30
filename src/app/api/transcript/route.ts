import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

function extractVideoId(url: string): string | null {
  const patterns = [/[?&]v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /shorts\/([a-zA-Z0-9_-]{11})/]
  for (const p of patterns) { const m = url.match(p); if (m) return m[1] }
  return null
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url?.trim()) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    const videoId = extractVideoId(url.trim())
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })

    let title = '', author = ''
    try {
      const meta = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      if (meta.ok) { const d = await meta.json(); title = d.title || ''; author = d.author_name || '' }
    } catch {}

    let transcript = '', transcriptAvailable = false
    try {
      const entries = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      transcript = entries.map((e: any) => e.text).join(' ').replace(/\s+/g, ' ').trim()
      transcriptAvailable = transcript.length > 50
    } catch {
      try {
        const entries = await YoutubeTranscript.fetchTranscript(videoId)
        transcript = entries.map((e: any) => e.text).join(' ').replace(/\s+/g, ' ').trim()
        transcriptAvailable = transcript.length > 50
      } catch {}
    }

    return NextResponse.json({ videoId, title, author, transcript: transcript.slice(0, 12000), transcriptAvailable })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
