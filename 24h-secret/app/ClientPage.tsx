'use client'

import { useState } from 'react'
import ComposeBox from '@/components/ComposeBox'
import Feed from '@/components/Feed'
import type { Secret } from '@/lib/supabase'

interface Props {
  initialSecrets: Secret[]
}

export default function ClientPage({ initialSecrets }: Props) {
  const [newSecret, setNewSecret] = useState<Secret | null>(null)

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <header className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          🤫{' '}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            24h Secret
          </span>
        </h1>
        <p className="text-zinc-500 text-sm">
          Anonym. Ingen konto. Forsvinner etter 24 timer.
        </p>
      </header>

      <ComposeBox onPublished={(s) => setNewSecret(s)} />

      <Feed initialSecrets={initialSecrets} newSecret={newSecret} />
    </main>
  )
}
