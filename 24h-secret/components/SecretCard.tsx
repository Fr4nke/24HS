'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Secret } from '@/lib/supabase'
import WhisperModal from './WhisperModal'

const MOOD_COLORS: Record<string, string> = {
  relief:  'bg-blue-900/40 text-blue-300',
  shame:   'bg-red-900/40 text-red-300',
  pride:   'bg-yellow-900/40 text-yellow-300',
  regret:  'bg-orange-900/40 text-orange-300',
  longing: 'bg-purple-900/40 text-purple-300',
  anger:   'bg-red-900/60 text-red-200',
  fear:    'bg-indigo-900/40 text-indigo-300',
  joy:     'bg-green-900/40 text-green-300',
  other:   'bg-zinc-800 text-zinc-400',
}

const MOOD_LABELS: Record<string, string> = {
  relief: 'Relief', shame: 'Shame', pride: 'Pride', regret: 'Regret',
  longing: 'Longing', anger: 'Anger', fear: 'Fear', joy: 'Joy', other: 'Other',
}

const RANK_BADGES: Record<number, { bg: string; label: string }> = {
  1: { bg: 'bg-yellow-500', label: '#1' },
  2: { bg: 'bg-zinc-400', label: '#2' },
  3: { bg: 'bg-amber-700', label: '#3' },
}

function WhisperIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M2 9l10 6 10-6" />
    </svg>
  )
}

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
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
  currentUser?: User | null
}

export default function SecretCard({ secret, rank, currentUser }: Props) {
  const timeLeft = useCountdown(secret.expires_at)
  const [meToo, setMeToo] = useState(secret.reaction_me_too)
  const [wild, setWild] = useState(secret.reaction_wild)
  const [doubtful, setDoubtful] = useState(secret.reaction_doubtful)
  const [reacted, setReacted] = useState<Record<string, boolean>>({})
  const [whispering, setWhispering] = useState(false)

  const canWhisper = currentUser && secret.user_id && secret.user_id !== currentUser.id

  async function react(type: 'me_too' | 'wild' | 'doubtful') {
    const wasReacted = reacted[type]
    const delta = wasReacted ? -1 : 1
    if (type === 'me_too') setMeToo((n) => n + delta)
    else if (type === 'wild') setWild((n) => n + delta)
    else setDoubtful((n) => n + delta)
    setReacted((r) => ({ ...r, [type]: !wasReacted }))
    try {
      await fetch(`/api/secrets/${secret.id}/react`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action: wasReacted ? 'remove' : 'add' }),
      })
    } catch {
      if (type === 'me_too') setMeToo((n) => n - delta)
      else if (type === 'wild') setWild((n) => n - delta)
      else setDoubtful((n) => n - delta)
      setReacted((r) => ({ ...r, [type]: wasReacted }))
    }
  }

  const badge = rank !== undefined ? RANK_BADGES[rank] : undefined
  const moodColor = MOOD_COLORS[secret.mood] ?? MOOD_COLORS['other']
  const moodLabel = MOOD_LABELS[secret.mood] ?? secret.mood
  const handle = secret.user_id ? `#${secret.user_id.slice(-6)}` : null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative hover:border-zinc-700 transition-colors">
      {/* Invisible overlay covers padding areas */}
      <Link href={`/secrets/${secret.id}`} className="absolute inset-0 z-0 rounded-2xl" aria-hidden="true" tabIndex={-1} />

      {badge && (
        <span className={`absolute -top-3 -left-2 z-10 ${badge.bg} text-black text-xs font-bold px-2 py-0.5 rounded-full shadow`}>
          {badge.label}
        </span>
      )}

      {handle && (
        <span className="absolute top-3 right-4 z-10 text-[10px] text-zinc-700 font-mono">
          {handle}
        </span>
      )}

      {/* Text is its own link so clicking it navigates */}
      <Link href={`/secrets/${secret.id}`} className="relative z-10 block text-zinc-100 text-base leading-relaxed whitespace-pre-wrap break-words hover:text-zinc-200 transition-colors">
        {secret.text}
      </Link>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${moodColor}`}>{moodLabel}</span>
          <span className="text-xs text-zinc-600">⏳ {timeLeft}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => react('me_too')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm transition-colors ${
              reacted.me_too ? 'bg-violet-800 text-violet-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>🙋</span><span className="font-medium tabular-nums">{meToo}</span>
          </button>

          <button
            onClick={() => react('wild')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm transition-colors ${
              reacted.wild ? 'bg-amber-900 text-amber-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>🤯</span><span className="font-medium tabular-nums">{wild}</span>
          </button>

          <button
            onClick={() => react('doubtful')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm transition-colors ${
              reacted.doubtful ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>🤨</span><span className="font-medium tabular-nums">{doubtful}</span>
          </button>

          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm bg-zinc-800 text-zinc-500">
            <span>💬</span><span className="font-medium tabular-nums">{secret.comment_count ?? 0}</span>
          </span>

          {canWhisper && (
            <button
              onClick={() => setWhispering((w) => !w)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm transition-colors ${
                whispering ? 'bg-violet-900 text-violet-300' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <WhisperIcon />
            </button>
          )}
        </div>
      </div>

      {whispering && canWhisper && (
        <div className="relative z-10">
          <WhisperModal
            secretId={secret.id}
            receiverId={secret.user_id!}
            currentUser={currentUser}
            onClose={() => setWhispering(false)}
          />
        </div>
      )}
    </div>
  )
}
