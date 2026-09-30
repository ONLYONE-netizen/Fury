import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })
    const clean    = encodeURIComponent(`${prompt}, professional, clean, modern, high quality, no text`)
    const imageUrl = `https://image.pollinations.ai/prompt/${clean}?width=1200&height=630&nologo=true&enhance=true`
    return NextResponse.json({ imageUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
