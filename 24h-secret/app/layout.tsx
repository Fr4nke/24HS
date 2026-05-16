import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '24h Secret — Share anonymously, gone in 24h',
  description: 'Share secrets anonymously. No account. No trace. Gone after 24 hours.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}
