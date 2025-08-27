import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const entriesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  filters: z.string().optional(),
})

const createEntryBodySchema = z.object({
  skin_name: z.string().min(1),
  date_acquired: z.string(),
  price_buy: z.coerce.number(),
  price_sell: z.coerce.number().optional(),
  profit: z.coerce.number().optional(),
  status: z.enum(['en_attente', 'liste', 'vendu']).default('en_attente'),
  metadata: z.record(z.any()).optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const url = new URL(request.url)
  const parsed = entriesQuerySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const supabase = createSupabaseServerClient(request)
  const limit = parsed.data.limit
  let query = supabase
    .from('entries')
    .select('*')
    .eq('board_id', params.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  // cursor format: base64(`${created_at}|${id}`)
  if (parsed.data.cursor) {
    const decoded = Buffer.from(parsed.data.cursor, 'base64').toString('utf8')
    const [createdAtCursor, idCursor] = decoded.split('|')
    // keyset: created_at < cursor.created_at OR (created_at = cursor AND id < cursorId)
    query = query.lt('created_at', createdAtCursor).or(`and(created_at.eq.${createdAtCursor},id.lt.${idCursor})`)
  }
  const { data, error } = await query.limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  let nextCursor: string | null = null
  if (data && data.length === limit) {
    const last = data[data.length - 1] as { created_at: string; id: string }
    nextCursor = Buffer.from(`${last.created_at}|${last.id}`).toString('base64')
  }
  return NextResponse.json({ entries: data ?? [], nextCursor })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => ({}))
  const parsed = createEntryBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const supabase = createSupabaseServerClient(request)
  const { data, error } = await supabase
    .from('entries')
    .insert([{ ...parsed.data, board_id: params.id }])
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry: data }, { status: 201 })
}


