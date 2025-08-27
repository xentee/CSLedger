import { getSupabaseClient } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const supabase = getSupabaseClient()

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) return res.status(400).json({ error: signUpError.message })

  const access_token = authData.session?.access_token
  const user = authData.user
  if (!access_token || !user) return res.status(200).json({ message: 'Inscription réussie ! Confirme l’email si requis.' })

  return res.status(200).json({ message: 'Inscription réussie !', access_token, user: { id: user.id, email: user.email } })
}
