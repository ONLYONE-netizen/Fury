# Fury — AI Content Repurposing
## By Swift Lab

## STEP 1 — Install
npm install

## STEP 2 — Add env vars to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://pnhsvshimmrjjbjasdrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key

## STEP 3 — Run Supabase SQL
CREATE TABLE IF NOT EXISTS fury_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS fury_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fury_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own history" ON fury_history FOR ALL USING (auth.uid() = user_id);

## STEP 4 — Test locally
npm run dev

## STEP 5 — Deploy to Vercel
Push to GitHub, import in Vercel, add env vars, deploy.
