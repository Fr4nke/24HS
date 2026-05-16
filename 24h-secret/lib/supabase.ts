import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// For server-side routes that act on behalf of a logged-in user.
// Passes the user's JWT so auth.uid() is set in RLS policies.
export function getSupabaseForUser(token: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export type Mood = 'relief' | 'shame' | 'pride' | 'regret' | 'longing' | 'anger' | 'fear' | 'joy' | 'other'

export interface Secret {
  id: string
  text: string
  mood: Mood
  created_at?: string
  expires_at: string
  reaction_me_too: number
  reaction_wild: number
  reaction_doubtful: number
  user_id?: string | null
  comment_count?: number
}
