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
  const { data, error } = await supabase
    .from('boards')
    .insert([{ name: parsed.data.name, settings: parsed.data.settings ?? {} }])
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ board: data }, { status: 201 })
}


