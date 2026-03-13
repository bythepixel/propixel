import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '../../components/Header'

export default function HubSpotGateway() {
    const { data: session, status } = useSession()
    const [config, setConfig] = useState({
        dealValueField: 'amount',
        proposalStatusField: 'proposal_status',
        submittalDateField: 'closedate',
        syncEnabled: true
    })

    // Mock saving configuration
    const handleSave = () => {
        alert('HubSpot Mapping Configuration Saved locally (Simulation)')
    }

    if (status === 'loading' || !session) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
            <Head><title>HubSpot Gateway - ProPixel</title></Head>
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-10 text-center">
                    <div className="inline-block p-3 bg-orange-600/20 rounded-2xl mb-4">
                        <span className="text-3xl">🧩</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">HubSpot Gateway</h1>
                    <p className="text-slate-400 mt-2">Configure property mapping and sync automated workflows.</p>
                </div>

                <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Deal Property Mapping</h2>
                            <span className="px-3 py-1 bg-green-900/40 text-green-400 text-xs font-bold rounded-full">ACTIVE SYNC</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Map ProPixel internal fields to HubSpot Deal properties.</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ProPixel: Proposal Value</label>
                                    <select className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 text-sm">
                                        <option value="amount">HubSpot: Amount (Standard)</option>
                                        <option value="custom_value">HubSpot: Custom Value Field</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ProPixel: Submission Date</label>
                                    <select className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 text-sm">
                                        <option value="closedate">HubSpot: Close Date (Standard)</option>
                                        <option value="sent_date">HubSpot: Sent Date (Custom)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sync Frequency</label>
                                    <select className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 text-sm">
                                        <option>Real-time (Webhook)</option>
                                        <option>Every 15 minutes</option>
                                        <option>Daily at 12:00 AM</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                    <span className="text-sm font-semibold">Enable Deep Sync</span>
                                    <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-xl flex gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-xs text-amber-500 leading-relaxed">
                                <strong>Attention:</strong> Property mapping ensures that when a Sales Lead moves the "Value Slider," the corresponding HubSpot Deal is updated instantly.
                                Ensure your HubSpot API scopes include <code>crm.objects.deals.write</code>.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900/50 flex justify-end gap-3">
                        <button className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-all font-semibold">Cancel</button>
                        <button onClick={handleSave} className="px-8 py-2 bg-blue-600 rounded-xl font-bold shadow-lg hover:shadow-blue-500/20 transition-all">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
