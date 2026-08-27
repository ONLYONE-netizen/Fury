import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })

    // Pollinations.ai — completely free, no API key needed
    const cleanPrompt = encodeURIComponent(
      `${prompt}, professional, clean design, modern, high quality, no text`
    )
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1200&height=630&nologo=true&enhance=true`

    // Verify the image loads
    const check = await fetch(imageUrl, { method: 'HEAD' })
    if (!check.ok) throw new Error('Image generation failed')

    return NextResponse.json({ imageUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 })
  }
}
