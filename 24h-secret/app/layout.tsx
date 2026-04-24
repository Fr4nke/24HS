import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '24h Secret — Del anonymt, forsvinner på 24t',
  description: 'Del hemmeligheter anonymt. Ingen konto. Ingen spor. Slettes etter 24 timer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}
