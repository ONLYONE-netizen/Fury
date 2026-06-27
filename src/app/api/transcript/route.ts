import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

async function getVideoMeta(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    if (!res.ok) return { title: '', author: '' }
    const data = await res.json()
    return { title: data.title || '', author: data.author_name || '' }
  } catch {
    return { title: '', author: '' }
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url?.trim()) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    const videoId = extractVideoId(url.trim())
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Paste a link like https://youtube.com/watch?v=xxxxx' }, { status: 400 })
    }

    // Always fetch meta
    const meta = await getVideoMeta(videoId)

    // Try to fetch transcript server-side — no CORS issues here
    let transcript = ''
    let transcriptAvailable = false

    try {
      const entries = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      transcript = entries.map(e => e.text).join(' ').replace(/\s+/g, ' ').trim()
      transcriptAvailable = transcript.length > 50
    } catch {
      // Try without language specification
      try {
        const entries = await YoutubeTranscript.fetchTranscript(videoId)
        transcript = entries.map(e => e.text).join(' ').replace(/\s+/g, ' ').trim()
        transcriptAvailable = transcript.length > 50
      } catch {
        transcriptAvailable = false
      }
    }

    if (transcriptAvailable) {
      return NextResponse.json({
        videoId,
        title: meta.title,
        author: meta.author,
        transcript: transcript.slice(0, 12000),
        transcriptAvailable: true,
      })
    }

    // No transcript — return meta only
    if (!meta.title) {
      return NextResponse.json({
        error: 'Could not get video info. The video may be private or unavailable.',
      }, { status: 404 })
    }

    return NextResponse.json({
      videoId,
      title: meta.title,
      author: meta.author,
      transcript: '',
      transcriptAvailable: false,
    })

  } catch (err: any) {
    console.error('Transcript error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch transcript' }, { status: 500 })
  }
}
