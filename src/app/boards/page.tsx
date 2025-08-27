'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

type Board = { id: string; name: string; created_at: string }

export default function BoardsPage() {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_access_token') : null
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = async () => {
    const res = await fetch('/api/boards', {
      headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!res.ok) throw new Error('Erreur chargement boards')
    return (await res.json()) as { boards: Board[] }
  }

  const { data, isLoading } = useQuery({ queryKey: ['boards'], queryFn: fetchBoards, staleTime: 10_000 })

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || 'Création impossible')
      return body
    },
    onSuccess: () => {
      setName('')
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
    onError: (e: any) => setError(e?.message || 'Erreur inconnue'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Suppression impossible')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
    onError: (e: any) => setError(e?.message || 'Erreur inconnue'),
  })

  const boards = data?.boards ?? []
  const remaining = Math.max(0, 3 - boards.length)

  return (
    <main className="min-h-screen p-6 space-y-6 bg-gray-50">
      <h1 className="text-2xl font-semibold">Boards</h1>

      <section className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm text-gray-600">Quota free: 3 boards max. Restants: {remaining}</div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du board"
            className="px-3 py-2 border rounded w-64"
          />
          <button
            disabled={isLoading || createMutation.isPending || boards.length >= 3 || !name.trim()}
            onClick={() => createMutation.mutate({ name: name.trim() })}
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
          >
            Créer
          </button>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
      </section>

      <section className="rounded border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Créé le</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-4 py-3" colSpan={3}>Chargement…</td></tr>
            ) : boards.length === 0 ? (
              <tr><td className="px-4 py-3 text-gray-500" colSpan={3}>Aucun board</td></tr>
            ) : (
              boards.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(b.id)}
                      className="px-3 py-1 rounded border text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}


