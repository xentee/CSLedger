'use client'
import { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setMessage(data.message || data.error)
    if (res.ok && data.access_token) {
      localStorage.setItem('sb_access_token', data.access_token)
      window.location.href = '/dashboard'
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Create an account</h1>
        {/* Username retiré pour simplifier, Supabase gère le user dans auth.users */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Inscription…' : "S'inscrire"}
        </button>
        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  )
}

