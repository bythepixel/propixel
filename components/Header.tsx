import Link from 'next/link'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Proposals', href: '/admin/proposals' },
    { name: 'Blocks', href: '/admin/blocks' },
    { name: 'Team', href: '/admin/team' },
    { name: 'Branding', href: '/admin/palettes' },
    { name: 'Companies', href: '/admin/companies' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Users', href: '/admin/users' },
    { name: 'HubSpot', href: '/admin/hubspot' },
  ]

  const isActive = (path: string) => router.pathname === path

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              ProPixel <span className="text-blue-500 text-xs font-bold uppercase tracking-widest ml-1 bg-blue-500/10 px-2 py-0.5 rounded">Admin</span>
            </h1>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive(link.href)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {session?.user?.email && (
              <div className="hidden lg:block text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Agent</p>
                <p className="text-xs font-mono text-slate-300">{session.user.email.split('@')[0]}</p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 p-2.5 rounded-xl transition-all border border-slate-700"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
