import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { content, title, author, transcriptAvailable } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      },
    })

    const sourceDesc = transcriptAvailable
      ? `YouTube video transcript${title ? ` from "${title}"${author ? ` by ${author}` : ''}` : ''}`
      : title
      ? `YouTube video titled "${title}"${author ? ` by ${author}` : ''} (no transcript available — generate based on topic)`
      : 'text content'

    const prompt = `You are Fury — an AI content repurposing engine by Swift Lab.

Repurpose this ${sourceDesc} into 6 content formats. Be specific. Use real value from the content. No filler.

${title ? `Title: ${title}` : ''}
${author ? `Creator: ${author}` : ''}

Content:
${content.slice(0, 11000)}

Return ONLY raw JSON, no markdown, no backticks, no extra text:

{"hook":"...","summary":"...","tweets":["...","...","...","...","..."],"linkedin":"...","blog":"...","newsletter":{"subject":"...","body":"..."}}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format from AI')

    const parsed = JSON.parse(jsonMatch[0])

    const required = ['hook', 'summary', 'tweets', 'linkedin', 'blog', 'newsletter']
    for (const key of required) {
      if (!parsed[key]) throw new Error(`Missing field: ${key}`)
    }

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Repurpose error:', err)
    if (err.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'Invalid Gemini API key.' }, { status: 401 })
    }
    if (err.message?.includes('quota') || err.message?.includes('429')) {
      return NextResponse.json({ error: 'Gemini rate limit reached. Wait a minute and try again.' }, { status: 429 })
    }
    return NextResponse.json({ error: err.message || 'Content generation failed' }, { status: 500 })
  }
}
