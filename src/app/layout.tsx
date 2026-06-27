import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Fury — Content Repurpose AI by Swift Lab',
  description: 'Paste a YouTube link or text. Get tweets, a LinkedIn post, a blog article, a newsletter, and more — instantly.',
  keywords: ['content repurposing', 'AI content', 'YouTube to blog', 'Swift Lab', 'Fury'],
}

export const viewport: Viewport = {
  themeColor: '#fafaf9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
