import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const updateEntryBodySchema = z.object({
  skin_name: z.string().min(1).optional(),
  date_acquired: z.string().optional(),
  price_buy: z.coerce.number().optional(),
  price_sell: z.coerce.number().optional(),
  profit: z.coerce.number().optional(),
  status: z.enum(['en_attente', 'liste', 'vendu']).optional(),
  metadata: z.record(z.any()).optional(),
})

export async function PATCH(request: Request, { params }: { params: { entryId: string } }) {
  const json = await request.json().catch(() => ({}))
  const parsed = updateEntryBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const supabase = createSupabaseServerClient(request)
  const { data, error } = await supabase
    .from('entries')
    .update(parsed.data)
    .eq('id', params.entryId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(request: Request, { params }: { params: { entryId: string } }) {
  const supabase = createSupabaseServerClient(request)
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', params.entryId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}


