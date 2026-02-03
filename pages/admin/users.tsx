import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import Header from '../../components/Header'

type User = {
  id: number
  email: string | null
  firstName: string
  lastName: string
  isAdmin: boolean
  createdAt: string
}

type UserForm = {
  email: string
  password: string
  firstName: string
  lastName: string
  isAdmin: boolean
}

export default function Users() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState<UserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
  })
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchUsers()
    }
  }, [status, router])

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      email: form.email || null,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      isAdmin: form.isAdmin,
    }

    const res = await fetch(editingId ? `/api/users/${editingId}` : '/api/users', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Failed to save user')
      return
    }

    setForm({ email: '', password: '', firstName: '', lastName: '', isAdmin: false })
    setEditingId(null)
    setFormOpen(false)
    await fetchUsers()
  }

  const handleEdit = (user: User) => {
    setForm({
      email: user.email || '',
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      isAdmin: user.isAdmin,
    })
    setEditingId(user.id)
    setFormOpen(true)
  }

  const handleCancelEdit = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', isAdmin: false })
    setEditingId(null)
    setFormOpen(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this user? This action cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchUsers()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete user')
    }
  }

  if (status === "loading" || !session) return <div>Loading...</div>

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s)
    )
  })

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Head>
        <title>User Management - ProPixel</title>
      </Head>

      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[32%_1fr] gap-8">
          <div>
            <div className={`bg-slate-800 rounded-2xl shadow-sm border border-slate-700 ${formOpen || editingId ? 'p-6' : 'px-6 pt-6 pb-6'}`}>
              <h2
                className={`text-xl font-bold text-slate-100 flex items-center gap-2 ${formOpen || editingId ? 'mb-6' : 'mb-0'} ${!editingId ? 'cursor-pointer hover:text-indigo-400 transition-colors' : ''}`}
                onClick={() => !editingId && setFormOpen(!formOpen)}
              >
                {editingId ? (
                  <>
                    <span>✏️</span> Edit User
                  </>
                ) : (
                  <>
                    <span className="transition-transform duration-200" style={{ transform: formOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    + New User
                  </>
                )}
              </h2>
              {(formOpen || editingId) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">First Name <span className="text-red-500">*</span></label>
                    <input type="text" required className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" required className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="optional" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Password {!editingId && <span className="text-red-500">*</span>} {editingId && <span className="text-xs normal-case text-slate-500">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      required={!editingId}
                      className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      checked={form.isAdmin}
                      onChange={e => setForm({ ...form, isAdmin: e.target.checked })}
                    />
                    <label htmlFor="isAdmin" className="text-sm text-slate-300">
                      Admin User
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                      {editingId ? 'Update User' : 'Create User'}
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
                <span>👥</span> All Users
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-48"
              />
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-slate-800 rounded-lg shadow-sm" />)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 text-slate-500 text-sm">
                No users found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="group bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-semibold text-sm text-slate-100">{u.firstName} {u.lastName}</p>
                        {u.isAdmin && (
                          <span className="px-1.5 py-0.5 text-xs font-bold bg-indigo-500 text-white rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {u.email ? (
                          <p className="text-slate-500 text-xs font-mono">{u.email}</p>
                        ) : (
                          <p className="text-slate-500 text-xs italic">No email</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(u)}
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                        title="Edit User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                        title="Delete User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
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
