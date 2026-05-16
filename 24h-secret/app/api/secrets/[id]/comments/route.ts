import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('comments')
    .select('id, text, created_at, parent_id, user_id')
    .eq('secret_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { text, parent_id, user_id } = await req.json()

  if (!text || text.trim().length < 1 || text.trim().length > 500) {
    return NextResponse.json({ error: 'Comment must be 1–500 characters' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('comments')
    .insert({ secret_id: id, text: text.trim(), parent_id: parent_id ?? null, user_id: user_id ?? null })
    .select('id, text, created_at, parent_id, user_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
