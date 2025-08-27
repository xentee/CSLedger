import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient(request)
  // invested total & profits via agrégations; peut s'appuyer sur mv_stats_daily pour vitesse
  const { data: recent, error: recentError } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (recentError) return NextResponse.json({ error: recentError.message }, { status: 400 })

  // Placeholders: à optimiser avec SQL dédié + vue matérialisée
  const totals = { invested: 0, profitDay: 0, profitWeek: 0, profitMonth: 0 }
  const sellable7d: unknown[] = []

  return NextResponse.json({ totals, sellable7d, recent })
}


