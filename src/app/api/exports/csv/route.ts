import { NextResponse } from 'next/server'
import { z } from 'zod'

const exportBodySchema = z.object({
  board_id: z.string().uuid(),
  filters: z.string().optional(),
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}))
  const parsed = exportBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // TODO: lancer job d'export et retourner URL signé du Storage
  return NextResponse.json({ url: null, status: 'queued' }, { status: 202 })
}


