import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient(request)
  // Derniers trades
  const { data: recent, error: recentError } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (recentError) return NextResponse.json({ error: recentError.message }, { status: 400 })

  // Totaux rapides via agrégations directes (optimiser plus tard avec mv_stats_daily)
  const { data: investedAgg } = await supabase.rpc('sql', {
    q: `select coalesce(sum(price_buy),0)::float8 as invested from entries`,
  } as any).single()
  const invested = investedAgg?.invested ?? 0

  // Profit J/S/M (approximations initiales)
  const { data: profitDayAgg } = await supabase.rpc('sql', {
    q: `select coalesce(sum(profit),0)::float8 as p from entries where created_at >= now() - interval '1 day'`,
  } as any).single()
  const { data: profitWeekAgg } = await supabase.rpc('sql', {
    q: `select coalesce(sum(profit),0)::float8 as p from entries where created_at >= now() - interval '7 day'`,
  } as any).single()
  const { data: profitMonthAgg } = await supabase.rpc('sql', {
    q: `select coalesce(sum(profit),0)::float8 as p from entries where created_at >= now() - interval '30 day'`,
  } as any).single()

  const totals = {
    invested,
    profitDay: profitDayAgg?.p ?? 0,
    profitWeek: profitWeekAgg?.p ?? 0,
    profitMonth: profitMonthAgg?.p ?? 0,
  }

  // Vendables J+7: items avec date_acquired <= now()-7 et pas encore vendus
  const { data: sellable7d, error: sellErr } = await supabase
    .from('entries')
    .select('id, skin_name, date_acquired, price_buy, status')
    .lte('date_acquired', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
    .neq('status', 'vendu')
    .order('date_acquired', { ascending: false })
    .limit(50)
  if (sellErr) return NextResponse.json({ error: sellErr.message }, { status: 400 })

  return NextResponse.json({ totals, sellable7d, recent })
}


