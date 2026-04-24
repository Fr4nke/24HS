import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { type } = await req.json()

  if (type !== 'me_too' && type !== 'heart') {
    return NextResponse.json({ error: 'Ugyldig reaksjonstype' }, { status: 400 })
  }

  const col = type === 'me_too' ? 'reaction_me_too' : 'reaction_heart'

  const supabase = getSupabase()
  const { error } = await supabase.rpc('increment_reaction', {
    secret_id: id,
    col_name: col,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
