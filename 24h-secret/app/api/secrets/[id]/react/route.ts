import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COL_MAP: Record<string, string> = {
  me_too: 'reaction_me_too',
  wild: 'reaction_wild',
  doubtful: 'reaction_doubtful',
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { type, action } = await req.json()

  const col = COL_MAP[type]
  if (!col) return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })

  const delta = action === 'remove' ? -1 : 1

  const supabase = getSupabase()
  const { error } = await supabase.rpc('adjust_reaction', {
    p_secret_id: id,
    p_col_name: col,
    p_delta: delta,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
