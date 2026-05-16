import type { Metadata } from 'next'

export const metadata: Metadata = { title: '24h Secret — Admin' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning style={{
        margin: 0,
        background: '#0f0a0b',
        color: '#ffe8dc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 14,
      }}>
        {children}
      </body>
    </html>
  )
}
