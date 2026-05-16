import { getSupabase } from '@/lib/supabase'
import type { Secret } from '@/lib/supabase'
import ClientPage from './ClientPage'

export const dynamic = 'force-dynamic'

async function getInitialSecrets(): Promise<Secret[]> {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('secrets')
      .select('id, text, mood, expires_at, reaction_me_too, reaction_wild, reaction_doubtful, user_id')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  } catch {
    return []
  }
}

export default async function Home() {
  const initialSecrets = await getInitialSecrets()
  return <ClientPage initialSecrets={initialSecrets} />
}
