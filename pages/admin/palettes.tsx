import Head from 'next/head'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type StylePalette = {
    id: number
    name: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    isDefault: boolean
}

type PaletteForm = {
    name: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    isDefault: boolean
}

const emptyForm: PaletteForm = {
    name: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif',
    isDefault: false,
}

export default function Palettes() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [palettes, setPalettes] = useState<StylePalette[]>([])
    const [form, setForm] = useState<PaletteForm>(emptyForm)
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formOpen, setFormOpen] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchPalettes()
        }
    }, [status, router])

    const fetchPalettes = async () => {
        const res = await fetch('/api/palettes')
        if (res.ok) {
            const data = await res.json()
            setPalettes(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch(editingId ? `/api/palettes/${editingId}` : '/api/palettes', {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        if (res.ok) {
            setForm(emptyForm)
            setEditingId(null)
            setFormOpen(false)
            fetchPalettes()
        }
    }

    const handleEdit = (palette: StylePalette) => {
        setForm({
            name: palette.name,
            primaryColor: palette.primaryColor,
            secondaryColor: palette.secondaryColor,
            accentColor: palette.accentColor,
            fontFamily: palette.fontFamily,
            isDefault: palette.isDefault,
        })
        setEditingId(palette.id)
        setFormOpen(true)
    }

    if (status === 'loading' || !session) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
            <Head><title>Style Palettes - ProPixel</title></Head>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Visual Branding</h1>
                        <p className="text-slate-400 mt-1">Manage global themes and CSS variables for proposals.</p>
                    </div>
                    <button
                        onClick={() => { setFormOpen(!formOpen); setEditingId(null); setForm(emptyForm); }}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-all"
                    >
                        {formOpen ? 'Close' : '+ New Palette'}
                    </button>
                </div>

                {formOpen && (
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Palette Name</label>
                                    <input
                                        className="w-full bg-slate-900 p-3 rounded-lg border border-slate-700"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Family</label>
                                    <input
                                        className="w-full bg-slate-900 p-3 rounded-lg border border-slate-700"
                                        value={form.fontFamily}
                                        onChange={e => setForm({ ...form, fontFamily: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={form.isDefault}
                                        onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-slate-300">Set as default palette</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Color</label>
                                    <div className="flex gap-3">
                                        <input type="color" className="w-12 h-12 rounded bg-transparent border-none outline-none" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} />
                                        <input className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-sm" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secondary Color</label>
                                    <div className="flex gap-3">
                                        <input type="color" className="w-12 h-12 rounded bg-transparent border-none outline-none" value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} />
                                        <input className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-sm" value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Accent Color</label>
                                    <div className="flex gap-3">
                                        <input type="color" className="w-12 h-12 rounded bg-transparent border-none outline-none" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} />
                                        <input className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-sm" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="bg-slate-900 p-6 rounded-xl border border-dashed border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-4">Live Preview</p>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: form.secondaryColor, color: form.primaryColor, fontFamily: form.fontFamily }}>
                                    <h2 className="text-2xl font-bold mb-2">Proposal Title</h2>
                                    <p className="opacity-80 mb-4">This is how your proposal content will look with these colors.</p>
                                    <button className="px-4 py-2 rounded font-bold" style={{ backgroundColor: form.accentColor, color: '#fff' }}>Interactive Button</button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 p-3 rounded-lg font-bold">
                            {editingId ? 'Update Palette' : 'Save Palette'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {palettes.map(palette => (
                        <div key={palette.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden group">
                            <div className="h-24 flex">
                                <div className="flex-1" style={{ backgroundColor: palette.primaryColor }} />
                                <div className="flex-1" style={{ backgroundColor: palette.secondaryColor }} />
                                <div className="flex-1" style={{ backgroundColor: palette.accentColor }} />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold">{palette.name}</h3>
                                    {palette.isDefault && (
                                        <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs font-mono mb-4">{palette.fontFamily}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(palette)}
                                        className="flex-1 text-center py-2 rounded-lg bg-slate-900 text-blue-500 hover:bg-slate-700 transition-all font-semibold"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
