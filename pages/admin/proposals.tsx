import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type CompanyOption = {
  id: number
  name: string
  slug: string
}

type ClientOption = {
  id: number
  firstName: string
  lastName: string
  company: CompanyOption
}

type Proposal = {
  id: number
  title: string
  slug: string
  company?: CompanyOption | null
  client?: { id: number; firstName: string; lastName: string } | null
}

type ProposalForm = {
  title: string
  slug: string
  companyId: string
  clientId: string
}

const emptyForm: ProposalForm = {
  title: '',
  slug: '',
  companyId: '',
  clientId: '',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export default function Proposals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [form, setForm] = useState<ProposalForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    const [proposalsRes, companiesRes, clientsRes] = await Promise.all([
      fetch('/api/proposals'),
      fetch('/api/companies'),
      fetch('/api/clients'),
    ])

    if (proposalsRes.ok) setProposals(await proposalsRes.json())
    if (companiesRes.ok) setCompanies(await companiesRes.json())
    if (clientsRes.ok) setClients(await clientsRes.json())
    setLoading(false)
  }

  const filteredClients = useMemo(() => {
    if (!form.companyId) return clients
    return clients.filter((client) => client.company.id === Number(form.companyId))
  }, [clients, form.companyId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        companyId: form.companyId || null,
        clientId: form.clientId || null,
      }),
    })

    if (res.ok) {
      const proposal = await res.json()
      router.push(`/admin/proposals/${proposal.id}/edit`)
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to create proposal')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this proposal?')) return
    const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const filteredProposals = useMemo(() => {
    if (!search.trim()) return proposals
    const s = search.toLowerCase()
    return proposals.filter((p) =>
      `${p.title} ${p.slug} ${p.company?.name ?? ''} ${p.client?.firstName ?? ''}`.toLowerCase().includes(s)
    )
  }, [proposals, search])

  if (status === 'loading' || !session) return <div className="p-8 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <Head>
        <title>Proposals | ProPixel Admin</title>
      </Head>
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Create Section */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="bg-indigo-600 p-2 rounded-xl text-lg">➕</span>
                New Proposal
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Growth Strategy"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">URL Slug</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-indigo-400 outline-none"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98]">
                    Create & Open Workstation →
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Creating a proposal will initialize a new document and register a Deal in HubSpot. You'll be redirected to the Workstation to upload RFPs and build content.
              </p>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30">
              <h1 className="text-2xl font-black tracking-tight">Active Proposals</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter projects..."
                  className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <span className="text-4xl mb-4">🌑</span>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No proposals found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProposals.map((p) => (
                  <div key={p.id} className="group bg-slate-800 p-5 rounded-3xl border border-slate-700 hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-900/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0">
                        <h3 className="font-black text-lg truncate group-hover:text-indigo-400 transition-colors">{p.title}</h3>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">/p/{p.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/proposals/${p.id}/edit`)}
                          className="p-2.5 bg-slate-900 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-inner"
                          title="Open Workstation"
                        >
                          🚀
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2.5 bg-slate-900 text-slate-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-inner"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-indigo-500/20 rounded-md flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {p.company?.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">
                          {p.company?.name || 'Unassigned'}
                        </span>
                      </div>
                      {p.client && (
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                          {p.client.firstName} {p.client.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
