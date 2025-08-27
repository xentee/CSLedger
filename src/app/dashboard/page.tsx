'use client'
import { useQuery } from '@tanstack/react-query'

type DashboardResponse = {
  totals: { invested: number; profitDay: number; profitWeek: number; profitMonth: number }
  sellable7d: Array<any>
  recent: Array<any>
}

export default function DashboardPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_access_token') : null
  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard', {
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to load dashboard')
      return res.json()
    },
    staleTime: 30_000,
  })

  if (isLoading) return <div className="p-6">Chargement…</div>
  if (isError || !data) return <div className="p-6 text-red-400">Erreur de chargement du dashboard</div>

  const { totals, sellable7d, recent } = data

  return (
    <main className="min-h-screen p-6 space-y-8 bg-gray-50">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Investi total" value={totals.invested} />
        <Card title="Profit Jour" value={totals.profitDay} />
        <Card title="Profit Semaine" value={totals.profitWeek} />
        <Card title="Profit Mois" value={totals.profitMonth} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Vendables J+7</h2>
        <div className="overflow-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Skin</th>
                <th className="px-4 py-2">Date acquis</th>
                <th className="px-4 py-2">Prix achat</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {sellable7d.length === 0 ? (
                <tr><td className="px-4 py-3 text-gray-500" colSpan={4}>Aucun item vendable</td></tr>
              ) : sellable7d.map((e: any) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-2">{e.skin_name}</td>
                  <td className="px-4 py-2">{e.date_acquired}</td>
                  <td className="px-4 py-2">{e.price_buy}</td>
                  <td className="px-4 py-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Derniers trades</h2>
        <div className="overflow-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Skin</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Achat</th>
                <th className="px-4 py-2">Vente</th>
                <th className="px-4 py-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td className="px-4 py-3 text-gray-500" colSpan={5}>Aucun trade récent</td></tr>
              ) : recent.map((e: any) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-2">{e.skin_name}</td>
                  <td className="px-4 py-2">{e.date_acquired}</td>
                  <td className="px-4 py-2">{e.price_buy}</td>
                  <td className="px-4 py-2">{e.price_sell ?? '-'}</td>
                  <td className="px-4 py-2">{e.profit ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value.toFixed(2)}</div>
    </div>
  )
}


