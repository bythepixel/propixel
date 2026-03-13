import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

type Stats = {
    totalProposals: number
    wonProposals: number
    lostProposals: number
    pendingProposals: number
    winRate: string
    avgEngagement: string
}

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentProposals, setRecentProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchStats()
        }
    }, [status, router])

    const fetchStats = async () => {
        // In a real app, this would be a single optimized query
        const res = await fetch('/api/proposals')
        if (res.ok) {
            const proposals = await res.json()
            const total = proposals.length
            const won = proposals.filter((p: any) => p.outcome === 'WON').length
            const lost = proposals.filter((p: any) => p.outcome === 'LOST').length
            const pending = total - won - lost
            const winRate = total > 0 ? ((won / (won + lost || 1)) * 100).toFixed(1) : '0'

            setStats({
                totalProposals: total,
                wonProposals: won,
                lostProposals: lost,
                pendingProposals: pending,
                winRate: winRate + '%',
                avgEngagement: '4m 32s' // Mocked for now
            })
            setRecentProposals(proposals.slice(0, 5))
        }
        setLoading(false)
    }

    if (status === 'loading' || !session) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
            <Head><title>Analytics Dashboard - ProPixel</title></Head>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Analytics Hub</h1>
                    <p className="text-slate-400">Strategic overview of proposal performance and client engagement.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Proposals', value: stats?.totalProposals, icon: '🧾' },
                        { label: 'Win Rate', value: stats?.winRate, icon: '🏆', color: 'text-green-400' },
                        { label: 'Won / Lost', value: `${stats?.wonProposals} / ${stats?.lostProposals}`, icon: '📊' },
                        { label: 'Avg. Engagement', value: stats?.avgEngagement, icon: '⏱️' },
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</h3>
                            <p className={`text-3xl font-black ${card.color || 'text-white'}`}>{loading ? '...' : card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📈</span> Outcome Distribution
                        </h2>
                        <div className="h-64 flex items-end gap-4 px-4">
                            <div className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-green-500/20 border border-green-500/50 rounded-t-lg transition-all hover:bg-green-500/30" style={{ height: stats ? `${(stats.wonProposals / stats.totalProposals) * 100}%` : '0%' }}></div>
                                <span className="text-xs font-bold text-green-400">WON</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-red-500/20 border border-red-500/50 rounded-t-lg transition-all hover:bg-red-500/30" style={{ height: stats ? `${(stats.lostProposals / stats.totalProposals) * 100}%` : '0%' }}></div>
                                <span className="text-xs font-bold text-red-400">LOST</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-blue-500/20 border border-blue-500/50 rounded-t-lg transition-all hover:bg-blue-500/30" style={{ height: stats ? `${(stats.pendingProposals / stats.totalProposals) * 100}%` : '0%' }}></div>
                                <span className="text-xs font-bold text-blue-400">PENDING</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>🔥</span> Engagement Insights
                        </h2>
                        <div className="space-y-6">
                            {[
                                { label: 'Introduction Section', time: '1m 15s', depth: '95%' },
                                { label: 'Technical Solution', time: '2m 45s', depth: '82%' },
                                { label: 'Pricing & Value', time: '3m 10s', depth: '70%' },
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700">
                                    <div>
                                        <p className="font-bold text-sm">{row.label}</p>
                                        <p className="text-xs text-slate-500">View Duration</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-blue-400 font-bold">{row.time}</p>
                                        <p className="text-[10px] text-slate-600 uppercase font-bold">{row.depth} Completion</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span>🚀</span> Active Workstations
                        </h2>
                        <button 
                            onClick={() => router.push('/admin/proposals')}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                        >
                            View All Proposals →
                        </button>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentProposals.map((p) => (
                                <div key={p.id} className="group bg-slate-900 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm truncate pr-2">{p.title}</h3>
                                            <p className="text-[10px] text-slate-500 font-mono">/p/{p.slug}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                            p.status === 'DRAFT' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/admin/proposals/${p.id}/edit`)}
                                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all opacity-90 group-hover:opacity-100"
                                    >
                                        Enter Workstation
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
