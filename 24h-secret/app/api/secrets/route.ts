import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { text, mood } = await req.json()

  if (!text || text.length < 5 || text.length > 280) {
    return NextResponse.json({ error: 'Teksten må være mellom 5 og 280 tegn' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('secrets')
    .insert({ text, mood: mood ?? 'annet' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') ?? 'recent'
  const orderCol = sort === 'top' ? 'reaction_me_too' : 'created_at'

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('secrets')
    .select('id, text, mood, expires_at, reaction_me_too, reaction_heart')
    .gt('expires_at', new Date().toISOString())
    .order(orderCol, { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
