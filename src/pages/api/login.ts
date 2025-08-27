import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return res.status(401).json({ error: error.message })

  const access_token = data.session?.access_token
  const user = data.user
  if (!access_token || !user) return res.status(500).json({ error: 'Session invalide' })

  // Renvoie le token pour que le client l’enregistre (localStorage)
  res.status(200).json({
    message: 'Connexion réussie !',
    access_token,
    user: { id: user.id, email: user.email },
  })
}
