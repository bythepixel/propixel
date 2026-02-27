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
  const [editingId, setEditingId] = useState<number | null>(null)
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

    if (proposalsRes.ok) {
      const data = await proposalsRes.json()
      setProposals(data)
    }
    if (companiesRes.ok) {
      const data = await companiesRes.json()
      setCompanies(data)
    }
    if (clientsRes.ok) {
      const data = await clientsRes.json()
      setClients(data)
    }
    setLoading(false)
  }

  const filteredClients = useMemo(() => {
    if (!form.companyId) return clients
    const companyId = Number(form.companyId)
    return clients.filter((client) => client.company.id === companyId)
  }, [clients, form.companyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: form.title,
      slug: form.slug,
      companyId: form.companyId || null,
      clientId: form.clientId || null,
    }

    const res = await fetch(editingId ? `/api/proposals/${editingId}` : '/api/proposals', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Failed to save proposal')
      return
    }

    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
    await fetchData()
  }

  const handleEdit = (proposal: Proposal) => {
    setForm({
      title: proposal.title,
      slug: proposal.slug,
      companyId: proposal.company?.id?.toString() || '',
      clientId: proposal.client?.id?.toString() || '',
    })
    setEditingId(proposal.id)
    setFormOpen(true)
  }

  const handleCancelEdit = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this proposal? This action cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchData()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete proposal')
    }
  }

  const filteredProposals = useMemo(() => {
    if (!search.trim()) return proposals
    const s = search.toLowerCase()
    return proposals.filter((proposal) =>
      `${proposal.title} ${proposal.slug} ${proposal.company?.name ?? ''} ${proposal.client?.firstName ?? ''} ${proposal.client?.lastName ?? ''}`
        .toLowerCase()
        .includes(s)
    )
  }, [proposals, search])

  if (status === 'loading' || !session) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Head>
        <title>Proposal Management - ProPixel</title>
      </Head>

      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-8">
          <div>
            <div className={`bg-slate-800 rounded-2xl shadow-sm border border-slate-700 ${formOpen || editingId ? 'p-6' : 'px-6 pt-6 pb-6'}`}>
              <h2
                className={`text-xl font-bold text-slate-100 flex items-center gap-2 ${formOpen || editingId ? 'mb-6' : 'mb-0'} ${!editingId ? 'cursor-pointer hover:text-indigo-400 transition-colors' : ''}`}
                onClick={() => !editingId && setFormOpen(!formOpen)}
              >
                {editingId ? (
                  <>
                    <span>🧾</span> Edit Proposal
                  </>
                ) : (
                  <>
                    <span className="transition-transform duration-200" style={{ transform: formOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    + New Proposal
                  </>
                )}
              </h2>
              {(formOpen || editingId) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.title}
                      onChange={(e) => {
                        const value = e.target.value
                        setForm((prev) => ({
                          ...prev,
                          title: value,
                          slug: prev.slug ? prev.slug : slugify(value),
                        }))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.companyId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          companyId: e.target.value,
                          clientId: '',
                        }))
                      }
                    >
                      <option value="">Unassigned</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Client</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.clientId}
                      onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {filteredClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} ({client.company.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                      {editingId ? 'Update Proposal' : 'Create Proposal'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 bg-slate-600 text-slate-500 rounded-xl font-semibold hover:bg-slate-500 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>🧾</span> All Proposals
              </h2>
              <input
                type="text"
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-48"
              />
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-slate-800 rounded-lg shadow-sm" />
                ))}
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-8 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 text-slate-500 text-sm">
                No proposals found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredProposals.map((proposal) => (
                  <div key={proposal.id} className="group bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-100">{proposal.title}</p>
                      <p className="text-slate-500 text-xs font-mono">{proposal.slug}</p>
                      <p className="text-slate-500 text-xs">
                        {proposal.client
                          ? `${proposal.client.firstName} ${proposal.client.lastName}`
                          : proposal.company?.name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(proposal)}
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                        title="Edit Proposal"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(proposal.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                        title="Delete Proposal"
                      >
                        🗑️
                      </button>
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
