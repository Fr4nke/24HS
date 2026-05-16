import { getSupabase, getSupabaseForUser } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-server'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { filterProfanity, containsURL } from '@/lib/content-filter'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secretId = searchParams.get('secret_id')
  if (!secretId) return NextResponse.json({ error: 'Missing secret_id' }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('comments')
    .select('id, text, created_at, parent_id, user_id')
    .eq('secret_id', secretId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const ip = getClientIP(req)
  if (!rateLimit(ip, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { secret_id, text, parent_id } = await req.json()
  if (!secret_id) return NextResponse.json({ error: 'Missing secret_id' }, { status: 400 })

  if (!text || text.trim().length < 1 || text.trim().length > 500) {
    return NextResponse.json({ error: 'Comment must be 1–500 characters' }, { status: 400 })
  }

  if (containsURL(text)) {
    return NextResponse.json({ error: 'URLs are not allowed in comments.' }, { status: 400 })
  }

  const filtered = filterProfanity(text.trim())
  const token = req.headers.get('Authorization')?.slice(7)
  const user = token ? await getUserFromRequest(req) : null
  const supabase = token ? getSupabaseForUser(token) : getSupabase()

  const { data, error } = await supabase
    .from('comments')
    .insert({ secret_id, text: filtered, parent_id: parent_id ?? null, user_id: user?.id ?? null })
    .select('id, text, created_at, parent_id, user_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
