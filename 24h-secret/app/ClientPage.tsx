'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import ComposeBox from '@/components/ComposeBox'
import Feed from '@/components/Feed'
import AuthHeader from '@/components/AuthHeader'
import type { Secret } from '@/lib/supabase'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] })

interface Props {
  initialSecrets: Secret[]
}

export default function ClientPage({ initialSecrets }: Props) {
  const [newSecret, setNewSecret] = useState<Secret | null>(null)

  return (
    <main className="max-w-xl mx-auto px-4 pt-5 pb-8 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="24h Secret" width={130} height={130} priority unoptimized />
          <div className="-mt-1">
            <h1 className={`text-2xl font-bold leading-tight text-zinc-100 ${spaceGrotesk.className}`}>24h Secret</h1>
            <p className="text-zinc-500 text-xs leading-snug">A world of secrets. Gone in 24h.</p>
          </div>
        </div>
        <AuthHeader />
      </header>

      <ComposeBox onPublished={(s) => setNewSecret(s)} />

      <Feed initialSecrets={initialSecrets} newSecret={newSecret} />
    </main>
  )
}
