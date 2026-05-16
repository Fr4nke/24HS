'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import SecretCard from './SecretCard'
import FeedToggle from './FeedToggle'
import type { Secret } from '@/lib/supabase'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Props {
  initialSecrets: Secret[]
  newSecret?: Secret | null
}

export default function Feed({ initialSecrets, newSecret }: Props) {
  const [sort, setSort] = useState<'recent' | 'top'>('recent')
  const [secrets, setSecrets] = useState<Secret[]>(initialSecrets)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchSecrets = useCallback(async (s: 'recent' | 'top') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/secrets?sort=${s}`)
      const data = await res.json()
      setSecrets(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSecrets(sort)
  }, [sort, fetchSecrets])

  useEffect(() => {
    if (!newSecret) return
    if (sort === 'recent') {
      setSecrets((prev) => [newSecret, ...prev.filter((s) => s.id !== newSecret.id)])
    }
  }, [newSecret, sort])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FeedToggle sort={sort} onChange={setSort} />
        {sort === 'top' && (
          <span className="text-xs text-zinc-500">Most reacted in the last 24h</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">🤫</p>
          <p>No secrets yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {secrets.map((secret, i) => (
            <SecretCard
              key={secret.id}
              secret={secret}
              rank={sort === 'top' && i < 3 ? i + 1 : undefined}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}
