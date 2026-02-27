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

type Client = {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  title?: string | null
  company: CompanyOption
  createdAt: string
}

type ClientForm = {
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
}

const emptyForm: ClientForm = {
  companyId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
}

export default function Clients() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [form, setForm] = useState<ClientForm>(emptyForm)
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
    const [clientsRes, companiesRes] = await Promise.all([
      fetch('/api/clients'),
      fetch('/api/companies'),
    ])

    if (clientsRes.ok) {
      const data = await clientsRes.json()
      setClients(data)
    }
    if (companiesRes.ok) {
      const data = await companiesRes.json()
      setCompanies(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      companyId: form.companyId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      phone: form.phone || null,
      title: form.title || null,
    }

    const res = await fetch(editingId ? `/api/clients/${editingId}` : '/api/clients', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Failed to save client')
      return
    }

    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
    await fetchData()
  }

  const handleEdit = (client: Client) => {
    setForm({
      companyId: client.company.id.toString(),
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email || '',
      phone: client.phone || '',
      title: client.title || '',
    })
    setEditingId(client.id)
    setFormOpen(true)
  }

  const handleCancelEdit = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this client? This action cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchData()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete client')
    }
  }

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients
    const s = search.toLowerCase()
    return clients.filter((client) =>
      `${client.firstName} ${client.lastName} ${client.company.name} ${client.company.slug}`
        .toLowerCase()
        .includes(s)
    )
  }, [clients, search])

  if (status === 'loading' || !session) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Head>
        <title>Client Management - ProPixel</title>
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
                    <span>👤</span> Edit Client
                  </>
                ) : (
                  <>
                    <span className="transition-transform duration-200" style={{ transform: formOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    + New Client
                  </>
                )}
              </h2>
              {(formOpen || editingId) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.companyId}
                      onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                      {editingId ? 'Update Client' : 'Create Client'}
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
                <span>👤</span> All Clients
              </h2>
              <input
                type="text"
                placeholder="Search clients..."
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
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 text-slate-500 text-sm">
                No clients found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredClients.map((client) => (
                  <div key={client.id} className="group bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-100">{client.firstName} {client.lastName}</p>
                      <p className="text-slate-500 text-xs">{client.company.name}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                        title="Edit Client"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                        title="Delete Client"
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
