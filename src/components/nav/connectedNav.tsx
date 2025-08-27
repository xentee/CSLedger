'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ConnectedNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sb_access_token')
    setIsAuthed(!!token)
  }, [pathname])

  if (!isAuthed) return null

  const linkClass = (href: string) =>
    `px-3 py-2 rounded ${pathname?.startsWith(href) ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-800/60'}`

  return (
    <header className="sticky top-0 z-40 bg-indigo-900 text-indigo-100 border-b border-indigo-800">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">CSLedger</div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link href="/boards" className={linkClass('/boards')}>Boards</Link>
          <button
            onClick={() => {
              localStorage.removeItem('sb_access_token')
              router.push('/')
            }}
            className="ml-2 px-3 py-2 rounded border border-indigo-700 hover:bg-indigo-800/60"
          >
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  )
}


