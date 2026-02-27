import Link from 'next/link'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const isActive = (path: string) => router.pathname === path

  return (
    <div className="w-full bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              P
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              ProPixel
            </h1>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/admin/users')
                  ? 'bg-slate-700 text-indigo-400'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/companies"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/admin/companies')
                  ? 'bg-slate-700 text-indigo-400'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
              }`}
            >
              Companies
            </Link>
            <Link
              href="/admin/clients"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/admin/clients')
                  ? 'bg-slate-700 text-indigo-400'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
              }`}
            >
              Clients
            </Link>
            <Link
              href="/admin/proposals"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/admin/proposals')
                  ? 'bg-slate-700 text-indigo-400'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
              }`}
            >
              Proposals
            </Link>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-all"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      {session?.user?.email && (
        <div className="bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            Signed in as <span className="font-mono text-slate-400">{session.user.email}</span>
          </div>
        </div>
      )}
    </div>
  )
}
