import { NextResponse } from 'next/server'

export const maxDuration = 30 // Pollinations.ai generation can be slow; default 10s Hobby limit isn't enough

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const clean    = encodeURIComponent(`${prompt}, professional, clean, modern, high quality, no text`)
    const imageUrl = `https://image.pollinations.ai/prompt/${clean}?width=1200&height=630&nologo=true&enhance=true&seed=${Date.now()}`

    // Pollinations.ai is known to intermittently return 403/502/timeout — verify before
    // handing the URL back, so the client gets a real error instead of a broken image.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    try {
      const check = await fetch(imageUrl, { method: 'GET', signal: controller.signal })
      clearTimeout(timeout)
      if (!check.ok) {
        return NextResponse.json({ error: 'Image service is temporarily unavailable. Try again in a moment.' }, { status: 502 })
      }
    } catch (fetchErr: any) {
      clearTimeout(timeout)
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json({ error: 'Image generation timed out. Try again.' }, { status: 504 })
      }
      return NextResponse.json({ error: 'Image service is temporarily unavailable. Try again in a moment.' }, { status: 502 })
    }

    return NextResponse.json({ imageUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 })
  }
}
