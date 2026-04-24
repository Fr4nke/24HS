'use client'

import { useState, useEffect } from 'react'
import type { Secret } from '@/lib/supabase'

const MOOD_COLORS: Record<string, string> = {
  lettelse: 'bg-blue-900/40 text-blue-300',
  skam: 'bg-red-900/40 text-red-300',
  stolthet: 'bg-yellow-900/40 text-yellow-300',
  anger: 'bg-orange-900/40 text-orange-300',
  annet: 'bg-zinc-800 text-zinc-400',
}

const RANK_BADGES: Record<number, { bg: string; label: string }> = {
  1: { bg: 'bg-yellow-500', label: '#1' },
  2: { bg: 'bg-zinc-400', label: '#2' },
  3: { bg: 'bg-amber-700', label: '#3' },
}

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Utløpt'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(`${h}t ${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1_000)
    return () => clearInterval(id)
  }, [expiresAt])

  return timeLeft
}

interface Props {
  secret: Secret
  rank?: number
}

export default function SecretCard({ secret, rank }: Props) {
  const timeLeft = useCountdown(secret.expires_at)
  const [meToo, setMeToo] = useState(secret.reaction_me_too)
  const [heart, setHeart] = useState(secret.reaction_heart)
  const [reacted, setReacted] = useState<{ me_too: boolean; heart: boolean }>({
    me_too: false,
    heart: false,
  })

  async function react(type: 'me_too' | 'heart') {
    if (reacted[type]) return
    if (type === 'me_too') setMeToo((n) => n + 1)
    else setHeart((n) => n + 1)
    setReacted((r) => ({ ...r, [type]: true }))

    try {
      await fetch(`/api/secrets/${secret.id}/react`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
    } catch {
      if (type === 'me_too') setMeToo((n) => n - 1)
      else setHeart((n) => n - 1)
      setReacted((r) => ({ ...r, [type]: false }))
    }
  }

  const badge = rank !== undefined ? RANK_BADGES[rank] : undefined

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative">
      {badge && (
        <span
          className={`absolute -top-3 -left-2 ${badge.bg} text-black text-xs font-bold px-2 py-0.5 rounded-full shadow`}
        >
          {badge.label}
        </span>
      )}

      <p className="text-zinc-100 text-base leading-relaxed whitespace-pre-wrap break-words">
        {secret.text}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              MOOD_COLORS[secret.mood] ?? MOOD_COLORS['annet']
            }`}
          >
            {secret.mood}
          </span>
          <span className="text-xs text-zinc-600">⏳ {timeLeft}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => react('me_too')}
            disabled={reacted.me_too}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors ${
              reacted.me_too
                ? 'bg-violet-800 text-violet-200'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>🙋</span>
            <span className="font-medium tabular-nums">{meToo}</span>
            <span className="text-xs">meg også</span>
          </button>

          <button
            onClick={() => react('heart')}
            disabled={reacted.heart}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors ${
              reacted.heart
                ? 'bg-pink-900 text-pink-300'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>❤️</span>
            <span className="font-medium tabular-nums">{heart}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
