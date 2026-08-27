import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { error } = await supabase.from('fury_subscribers').upsert(
      { email, source: source || 'landing', created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
