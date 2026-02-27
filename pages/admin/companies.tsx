import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type Company = {
  id: number
  name: string
  slug: string
  website?: string | null
  industry?: string | null
  phone?: string | null
  email?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  createdAt: string
}

type CompanyForm = {
  name: string
  slug: string
  website: string
  industry: string
  phone: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const emptyForm: CompanyForm = {
  name: '',
  slug: '',
  website: '',
  industry: '',
  phone: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export default function Companies() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState<CompanyForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchCompanies()
    }
  }, [status, router])

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies')
    if (res.ok) {
      const data = await res.json()
      setCompanies(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
    }

    const res = await fetch(editingId ? `/api/companies/${editingId}` : '/api/companies', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Failed to save company')
      return
    }

    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
    await fetchCompanies()
  }

  const handleEdit = (company: Company) => {
    setForm({
      name: company.name,
      slug: company.slug,
      website: company.website || '',
      industry: company.industry || '',
      phone: company.phone || '',
      email: company.email || '',
      address1: company.address1 || '',
      address2: company.address2 || '',
      city: company.city || '',
      state: company.state || '',
      postalCode: company.postalCode || '',
      country: company.country || '',
    })
    setEditingId(company.id)
    setFormOpen(true)
  }

  const handleCancelEdit = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormOpen(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this company? This action cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchCompanies()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete company')
    }
  }

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies
    const s = search.toLowerCase()
    return companies.filter((company) =>
      `${company.name} ${company.slug}`.toLowerCase().includes(s)
    )
  }, [companies, search])

  if (status === 'loading' || !session) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Head>
        <title>Company Management - ProPixel</title>
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
                    <span>🏢</span> Edit Company
                  </>
                ) : (
                  <>
                    <span className="transition-transform duration-200" style={{ transform: formOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    + New Company
                  </>
                )}
              </h2>
              {(formOpen || editingId) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.name}
                      onChange={(e) => {
                        const value = e.target.value
                        setForm((prev) => ({
                          ...prev,
                          name: value,
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Website</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address 1</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.address1}
                      onChange={(e) => setForm({ ...form, address1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address 2</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.address2}
                      onChange={(e) => setForm({ ...form, address2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Postal Code</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                      {editingId ? 'Update Company' : 'Create Company'}
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
                <span>🏢</span> All Companies
              </h2>
              <input
                type="text"
                placeholder="Search companies..."
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
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 text-slate-500 text-sm">
                No companies found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="group bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-100">{company.name}</p>
                      <p className="text-slate-500 text-xs font-mono">{company.slug}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(company)}
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                        title="Edit Company"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(company.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                        title="Delete Company"
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
