import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const createBoardBodySchema = z.object({
  name: z.string().min(1).max(200),
  settings: z.record(z.any()).optional(),
})

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient(request)
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)              // 🔒 ne renvoyer que ses boards
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
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Quota par utilisateur
  const { count, error: countErr } = await supabase
    .from('boards')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 400 })
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Quota atteint (free: 3 boards)' }, { status: 403 })
  }

  // Insert — on peut laisser Postgres mettre owner_id via DEFAULT auth.uid()
  const { data, error } = await supabase
    .from('boards')
    .insert([{ name: parsed.data.name, settings: parsed.data.settings ?? {} }])
    .select('*')
    .single()

  // Variante explicite si tu préfères : ajouter owner_id: user.id dans l’objet ci-dessus

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ board: data }, { status: 201 })
}
