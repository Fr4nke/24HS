import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
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
