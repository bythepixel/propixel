import Head from 'next/head'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type TeamMember = {
    id: number
    name: string
    title: string
    experience: string
    bio: string
    skillTags: string[]
}

type MemberForm = {
    name: string
    title: string
    experience: string
    bio: string
    skillTags: string
}

const emptyForm: MemberForm = {
    name: '',
    title: '',
    experience: '',
    bio: '',
    skillTags: '',
}

export default function Team() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [members, setMembers] = useState<TeamMember[]>([])
    const [form, setForm] = useState<MemberForm>(emptyForm)
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [formOpen, setFormOpen] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchMembers()
        }
    }, [status, router])

    const fetchMembers = async () => {
        const res = await fetch('/api/team-members')
        if (res.ok) {
            const data = await res.json()
            setMembers(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            ...form,
            skillTags: form.skillTags.split(',').map(t => t.trim()).filter(Boolean),
        }

        const res = await fetch(editingId ? `/api/team-members/${editingId}` : '/api/team-members', {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            setForm(emptyForm)
            setEditingId(null)
            setFormOpen(false)
            fetchMembers()
        }
    }

    const handleEdit = (member: TeamMember) => {
        setForm({
            name: member.name,
            title: member.title,
            experience: member.experience,
            bio: member.bio,
            skillTags: member.skillTags.join(', '),
        })
        setEditingId(member.id)
        setFormOpen(true)
    }

    const filteredMembers = useMemo(() => {
        if (!search.trim()) return members
        const s = search.toLowerCase()
        return members.filter(m =>
            m.name.toLowerCase().includes(s) ||
            m.title.toLowerCase().includes(s) ||
            m.skillTags.some(t => t.toLowerCase().includes(s))
        )
    }, [members, search])

    if (status === 'loading' || !session) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
            <Head><title>Team Directory - ProPixel</title></Head>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">Team Directory</h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search team..."
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            onClick={() => { setFormOpen(!formOpen); setEditingId(null); setForm(emptyForm); }}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-all"
                        >
                            {formOpen ? 'Close' : '+ New Member'}
                        </button>
                    </div>
                </div>

                {formOpen && (
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Full Name"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Job Title"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Experience (e.g. 8+ Years)"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.experience}
                                onChange={e => setForm({ ...form, experience: e.target.value })}
                            />
                            <input
                                placeholder="Skill Tags (comma separated)"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.skillTags}
                                onChange={e => setForm({ ...form, skillTags: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Professional Bio"
                            className="bg-slate-900 p-3 rounded-lg border border-slate-700 w-full h-32"
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            required
                        />
                        <button type="submit" className="w-full bg-blue-600 p-3 rounded-lg font-bold">
                            {editingId ? 'Update Profile' : 'Save Profile'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                                    {member.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold">{member.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{member.title}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{member.bio}</p>
                            <div className="flex flex-wrap gap-1 mb-6">
                                {member.skillTags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-blue-500/70 border border-blue-500/20">{tag}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleEdit(member)}
                                className="w-full text-center py-2 rounded-lg bg-slate-900 group-hover:bg-blue-600/20 text-blue-500 transition-all font-semibold"
                            >
                                Edit Profile
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
