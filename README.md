# Fury — Content Repurpose AI
## By Swift Lab

---

## STEP 1 — Install dependencies

```bash
npm install
```

---

## STEP 2 — Add your Gemini API key

Open `.env.local` and replace `YOUR_GEMINI_API_KEY_HERE` with your real key.

Get a free key at: https://aistudio.google.com/app/apikey

```
GEMINI_API_KEY=AIzaSy...
```

---

## STEP 3 — Test locally

```bash
npm run dev
```

Open http://localhost:3000

---

## STEP 4 — Push to GitHub

```bash
git init
git add .
git commit -m "Fury by Swift Lab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fury.git
git push -u origin main
```

---

## STEP 5 — Deploy to Vercel

1. Go to vercel.com
2. Click "Add New Project"
3. Import your `fury` GitHub repo
4. Under Environment Variables add:
   - `GEMINI_API_KEY` = your Gemini API key
5. Click Deploy
6. Done — live in 2 minutes

---

## What works on deployment
- YouTube URL — transcript fetched server-side, works on all devices
- Paste Text — works everywhere
- All 6 formats — Hook, Tweets, LinkedIn, Blog, Newsletter, Summary
- Gemini 1.5 Flash free tier — no cost at launch
