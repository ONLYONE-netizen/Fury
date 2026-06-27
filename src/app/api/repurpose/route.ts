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
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    })

    const sourceDesc = transcriptAvailable
      ? `YouTube video transcript${title ? ` from "${title}"${author ? ` by ${author}` : ''}` : ''}`
      : title
      ? `YouTube video titled "${title}"${author ? ` by ${author}` : ''} (no transcript available — generate based on topic)`
      : 'text content'

    const prompt = `You are Fury — an AI content repurposing engine by Swift Lab.

Repurpose this ${sourceDesc} into 6 content formats. Be specific. Use real value from the content. No filler or generic statements.

${title ? `Title: ${title}` : ''}
${author ? `Creator: ${author}` : ''}

Content:
${content.slice(0, 11000)}

Return ONLY a valid JSON object with these exact keys:

{
  "hook": "One viral opening sentence under 20 words that stops someone mid-scroll. Make it specific to this content. Bold and direct.",
  "summary": "3 to 4 sentences covering the core ideas from this content. Dense and informative.",
  "tweets": [
    "First tweet — specific insight from the content. Under 280 characters. No hashtags.",
    "Second tweet — another key point. Under 280 characters. No hashtags.",
    "Third tweet — actionable takeaway. Under 280 characters. No hashtags.",
    "Fourth tweet — surprising or contrarian angle. Under 280 characters. No hashtags.",
    "Fifth tweet — strong closing statement or CTA. Under 280 characters. No hashtags."
  ],
  "linkedin": "Full LinkedIn post between 300 and 500 words. Open with a strong hook that references the content. Use short paragraphs (1-3 lines max). Share 3-5 key insights. End with an engaging question. Add 5 to 7 relevant hashtags on a separate line at the end.",
  "blog": "Full SEO blog article between 600 and 900 words. First line must be the H1 title. Then a compelling intro paragraph. Then 3 sections each starting with ## H2 heading followed by 2-3 paragraphs of real substance. End with a conclusion paragraph. Use the actual content — make it genuinely useful.",
  "newsletter": {
    "subject": "Email subject line under 60 characters. Compelling and specific. Makes people want to open it.",
    "body": "Full newsletter body between 300 and 500 words. Conversational tone. Open with context. Share the 3 most valuable insights. Close with one clear call to action and a sign-off."
  }
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extract and parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format from AI')

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    const required = ['hook', 'summary', 'tweets', 'linkedin', 'blog', 'newsletter']
    for (const key of required) {
      if (!parsed[key]) throw new Error(`Missing field: ${key}`)
    }

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Repurpose error:', err)

    if (err.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'Invalid Gemini API key. Check your environment variables.' }, { status: 401 })
    }
    if (err.message?.includes('quota') || err.message?.includes('429')) {
      return NextResponse.json({ error: 'Gemini rate limit reached. Wait a minute and try again.' }, { status: 429 })
    }

    return NextResponse.json({ error: err.message || 'Content generation failed' }, { status: 500 })
  }
}
