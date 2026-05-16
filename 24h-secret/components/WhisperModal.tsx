'use client'

import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface Props {
  secretId: string
  receiverId: string
  currentUser: User
  onClose: () => void
}

export default function WhisperModal({ secretId, receiverId, currentUser, onClose }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    if (text.trim().length < 1) return
    setLoading(true)
    setError('')
    const supabase = getSupabaseBrowser()
    const { error: err } = await supabase.from('whispers').insert({
      secret_id: secretId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      text: text.trim(),
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="mt-3 rounded-xl bg-zinc-800/80 border border-zinc-700 p-4 space-y-3">
      {sent ? (
        <p className="text-sm text-violet-300 text-center py-1">Whisper sent 💬</p>
      ) : (
        <>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a whisper..."
            rows={2}
            maxLength={500}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none outline-none text-sm leading-relaxed"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={send}
              disabled={loading || text.trim().length < 1}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
