import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const createBoardBodySchema = z.object({
  name: z.string().min(1).max(200),
  settings: z.record(z.any()).optional(),
})

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient(request)
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ boards: data ?? [] })
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}))
  const parsed = createBoardBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const supabase = createSupabaseServerClient(request)
  // Quota free = 3 boards
  const { data: existing, error: countErr } = await supabase.from('boards').select('id', { count: 'exact', head: true })
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 400 })
  // Supabase renvoie le count via response, mais le SDK .select with head: true ne donne pas directement count ici.
  // Workaround: faire un select count(*)
  const { data: countRows, error: cntE } = await supabase.rpc('sql', { q: `select count(*)::int as c from boards` } as any).single()
  if (cntE) return NextResponse.json({ error: cntE.message }, { status: 400 })
  const count = countRows?.c ?? 0
  if (count >= 3) return NextResponse.json({ error: 'Quota atteint (free: 3 boards)' }, { status: 403 })
  const { data, error } = await supabase
    .from('boards')
    .insert([{ name: parsed.data.name, settings: parsed.data.settings ?? {} }])
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ board: data }, { status: 201 })
}


