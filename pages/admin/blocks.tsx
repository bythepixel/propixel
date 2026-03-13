import Head from 'next/head'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type ModularBlock = {
    id: number
    title: string
    content: string
    industryTags: string[]
    skillTags: string[]
    complexity: string
}

type BlockForm = {
    title: string
    content: string
    industryTags: string
    skillTags: string
    complexity: string
}

const emptyForm: BlockForm = {
    title: '',
    content: '',
    industryTags: '',
    skillTags: '',
    complexity: 'medium',
}

export default function Blocks() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [blocks, setBlocks] = useState<ModularBlock[]>([])
    const [form, setForm] = useState<BlockForm>(emptyForm)
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [formOpen, setFormOpen] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchBlocks()
        }
    }, [status, router])

    const fetchBlocks = async () => {
        const res = await fetch('/api/blocks')
        if (res.ok) {
            const data = await res.json()
            setBlocks(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            ...form,
            industryTags: form.industryTags.split(',').map(t => t.trim()).filter(Boolean),
            skillTags: form.skillTags.split(',').map(t => t.trim()).filter(Boolean),
        }

        const res = await fetch(editingId ? `/api/blocks/${editingId}` : '/api/blocks', {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            setForm(emptyForm)
            setEditingId(null)
            setFormOpen(false)
            fetchBlocks()
        }
    }

    const handleEdit = (block: ModularBlock) => {
        setForm({
            title: block.title,
            content: block.content,
            industryTags: block.industryTags.join(', '),
            skillTags: block.skillTags.join(', '),
            complexity: block.complexity,
        })
        setEditingId(block.id)
        setFormOpen(true)
    }

    const filteredBlocks = useMemo(() => {
        if (!search.trim()) return blocks
        const s = search.toLowerCase()
        return blocks.filter(b =>
            b.title.toLowerCase().includes(s) ||
            b.content.toLowerCase().includes(s) ||
            b.industryTags.some(t => t.toLowerCase().includes(s))
        )
    }, [blocks, search])

    if (status === 'loading' || !session) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
            <Head><title>Content Library - ProPixel</title></Head>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">Modular Block Library</h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search blocks..."
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            onClick={() => { setFormOpen(!formOpen); setEditingId(null); setForm(emptyForm); }}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-all"
                        >
                            {formOpen ? 'Close' : '+ New Block'}
                        </button>
                    </div>
                </div>

                {formOpen && (
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Block Title"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <select
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.complexity}
                                onChange={e => setForm({ ...form, complexity: e.target.value })}
                            >
                                <option value="low">Low Complexity</option>
                                <option value="medium">Medium Complexity</option>
                                <option value="high">High Complexity</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Content (Markdown supported)"
                            className="bg-slate-900 p-3 rounded-lg border border-slate-700 w-full h-32"
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Industry Tags (comma separated)"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.industryTags}
                                onChange={e => setForm({ ...form, industryTags: e.target.value })}
                            />
                            <input
                                placeholder="Skill Tags (comma separated)"
                                className="bg-slate-900 p-3 rounded-lg border border-slate-700"
                                value={form.skillTags}
                                onChange={e => setForm({ ...form, skillTags: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 p-3 rounded-lg font-bold">
                            {editingId ? 'Update Block' : 'Save Block'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlocks.map(block => (
                        <div key={block.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{block.title}</h3>
                                <span className={`text-xs uppercase px-2 py-1 rounded-full ${block.complexity === 'high' ? 'bg-red-900/40 text-red-400' :
                                        block.complexity === 'medium' ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'
                                    }`}>
                                    {block.complexity}
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm line-clamp-3 mb-4">{block.content}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {block.industryTags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500">#{tag}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleEdit(block)}
                                className="w-full text-center py-2 rounded-lg bg-slate-900 group-hover:bg-blue-600/20 text-blue-500 transition-all font-semibold"
                            >
                                Edit Block
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
