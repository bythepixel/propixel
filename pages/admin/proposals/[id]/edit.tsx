import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../../../components/Header";
import RFPAnalysisPanel from "../../../../components/proposals/RFPAnalysisPanel";
import BlockSidebar from "../../../../components/proposals/BlockSidebar";
import EditorCanvas from "../../../../components/proposals/EditorCanvas";
import ValueCostSlider from "../../../../components/proposals/ValueCostSlider";

interface ProposedBlock {
  tempId: string;
  id?: number;
  blockId: number;
  title: string;
  content: string;
}

const ProposalEditorPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [proposal, setProposal] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<ProposedBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [forceShowUpload, setForceShowUpload] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProposal();
      fetchMetadataOptions();
    }
  }, [id]);

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProposal(data);
        const mappedBlocks = (data.blocks || []).map((b: any) => ({
          tempId: `existing-${b.id}`,
          id: b.id,
          blockId: b.blockId,
          title: b.title || `Block #${b.blockId}`,
          content: b.content,
        }));
        setBlocks(mappedBlocks);
      }
    } catch (error) {
      console.error("Failed to fetch proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadataOptions = async () => {
    try {
      const [companiesRes, clientsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/clients'),
      ]);
      if (companiesRes.ok) setCompanies(await companiesRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
    } catch (error) {
      console.error("Failed to fetch metadata options:", error);
    }
  };

  const filteredClients = useMemo(() => {
    if (!proposal?.companyId) return clients;
    return clients.filter((c) => c.company.id === Number(proposal.companyId));
  }, [clients, proposal?.companyId]);

  const handleAddBlock = (block: any) => {
    const newBlock: ProposedBlock = {
      tempId: `new-${Date.now()}`,
      blockId: block.id,
      title: block.title,
      content: block.content,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleRemoveBlock = (tempId: string) => {
    setBlocks(blocks.filter((b) => b.tempId !== tempId));
  };

  const handleUpdateBlockContent = (tempId: string, content: string) => {
    setBlocks(
      blocks.map((b) => (b.tempId === tempId ? { ...b, content } : b))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposal.title,
          slug: proposal.slug,
          companyId: proposal.companyId ? Number(proposal.companyId) : null,
          clientId: proposal.clientId ? Number(proposal.clientId) : null,
          blocks: blocks.map((b) => ({
            blockId: b.blockId,
            content: b.content,
          })),
        }),
      });
      if (res.ok) {
        alert("Proposal saved successfully!");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncPrice = async (totalValue: number, totalCost: number) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/proposals/${id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalValue, totalCost }),
      });
      if (res.ok) {
        setProposal({ ...proposal, totalValue, totalCost });
        alert("Price synced to HubSpot!");
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    if (e instanceof File) {
      file = e;
    } else {
      file = e.target.files?.[0];
    }
    
    if (!file) return;
    console.log("File selected:", file.name, "Size:", file.size);

    if (!proposal?.companyId) {
      alert("Please assign a company to this proposal before uploading an RFP.");
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", proposal.companyId.toString());
    formData.append("proposalId", id as string);

    console.log("Uploading file for company:", proposal.companyId, "Proposal:", id);

    try {
      const res = await fetch("/api/proposals/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", res.status);

      if (res.ok) {
        const rfp = await res.json();
        console.log("Upload success:", rfp);
        setProposal({ ...proposal, rfpId: rfp.id, rfp });
        setForceShowUpload(false);
        
        // Automatically add suggested blocks to the editor if they exist
        if (rfp.suggestedBlocks && Array.isArray(rfp.suggestedBlocks)) {
          const newProposedBlocks = rfp.suggestedBlocks.map((block: any, index: number) => ({
            tempId: `ai-suggested-${Date.now()}-${index}`,
            blockId: block.id,
            title: block.title,
            content: block.content,
          }));
          setBlocks((currentBlocks) => [...currentBlocks, ...newProposedBlocks]);
        }
        
        alert("RFP uploaded and analyzed successfully! Recommended blocks have been added to your proposal.");
      } else {
        const err = await res.json();
        console.error("Upload server error:", err);
        alert(`Upload failed: ${err.error || 'Unknown server error'}`);
      }
    } catch (error: any) {
      console.error("Upload network error:", error);
      alert("Upload network error: " + (error.message || "Unknown error"));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');


  const handleReanalyze = async () => {
    if (!proposal?.rfpId) return;
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/proposals/${id}/reanalyze`, { method: "POST" });
      if (res.ok) {
        const updatedRfp = await res.json();
        setProposal({ ...proposal, rfp: updatedRfp });
        
        // Add new suggested blocks
        if (updatedRfp.suggestedBlocks && Array.isArray(updatedRfp.suggestedBlocks)) {
          const newProposedBlocks = updatedRfp.suggestedBlocks.map((block: any, index: number) => ({
            tempId: `ai-re-suggested-${Date.now()}-${index}`,
            blockId: block.id,
            title: block.title,
            content: block.content,
          }));
          setBlocks((currentBlocks) => [...currentBlocks, ...newProposedBlocks]);
        }
        alert("RFP re-analyzed successfully! Any new recommendations have been added.");
      } else {
        const err = await res.json();
        alert(`Re-analysis failed: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Re-analysis network error:", error);
      alert("Network error during re-analysis");
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSyncPricing = (value: number, cost: number) => {
    handleSyncPrice(value, cost);
  };

  if (loading) return <div className="p-8 text-white">Loading workstation...</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Head>
        <title>Workstation | {proposal?.title} | ProPixel</title>
      </Head>
      <Header />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
        {/* Left Side: Metadata & Analysis */}
        <div className="w-[40%] min-w-[400px] flex flex-col border-r border-gray-800 bg-gray-950 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white leading-tight">Proposal Control</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuration & Strategy</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? "Saving..." : "Save Proposal"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Metadata Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">01</span>
                <div className="h-px flex-1 bg-gray-800/50"></div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Core Metadata</p>
              </div>
              
              <div className="bg-gray-900/30 border border-gray-800 p-5 rounded-3xl space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">Target Company</label>
                    <select
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      value={proposal?.companyId || ""}
                      onChange={(e) => setProposal({ ...proposal, companyId: e.target.value, clientId: "" })}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">Primary Contact</label>
                    <select
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      value={proposal?.clientId || ""}
                      onChange={(e) => setProposal({ ...proposal, clientId: e.target.value })}
                    >
                      <option value="">Select Contact</option>
                      {filteredClients.map((c) => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">Deployment Path (Permalink)</label>
                  <div className="flex items-center gap-2 bg-black border border-gray-800 rounded-xl px-4 py-2.5">
                    <span className="text-[10px] text-gray-600 font-mono">/p/</span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none p-0 text-xs font-mono text-blue-400 focus:ring-0 outline-none"
                      value={proposal?.slug || ""}
                      onChange={(e) => setProposal({ ...proposal, slug: slugify(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* AI Strategy Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">02</span>
                <div className="h-px flex-1 bg-gray-800/50"></div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Intelligence & Retrieval</p>
              </div>

              {proposal?.rfp && !forceShowUpload ? (
                <div className="bg-blue-900/5 border border-blue-500/20 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      Source Document Linked
                    </p>
                    <button 
                      onClick={() => setForceShowUpload(true)}
                      className="text-[10px] text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors"
                    >
                      Change File
                    </button>
                  </div>
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-blue-500/10">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-2xl border border-blue-500/20 shadow-inner">
                      📄
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white truncate mb-0.5">
                        {proposal.rfp.originalFileUrl?.split('/').pop() || "rfp-document.pdf"}
                      </p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                        Processed: {new Date(proposal.rfp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`bg-gray-900/30 border-2 border-dashed ${uploadLoading ? 'border-blue-500/30 animate-pulse' : isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800'} p-6 rounded-3xl transition-all text-center`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="cursor-pointer group flex flex-col items-center">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" disabled={uploadLoading} />
                    <div className="w-12 h-12 bg-gray-950 rounded-2xl border border-gray-800 flex items-center justify-center mb-4 group-hover:border-blue-500/50 transition-all shadow-xl">
                      {uploadLoading ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-xl">📁</span>
                      )}
                    </div>
                    <p className={`text-xs ${isDragging ? 'text-blue-400' : 'text-gray-300'} font-bold mb-1`}>
                      {uploadLoading ? "Analyzing RFP..." : isDragging ? "Submit for Analysis" : "Analyze RFP Document"}
                    </p>
                    <p className="text-[10px] text-gray-600 font-medium max-w-[200px] leading-relaxed">
                      {isDragging ? "Drop it now" : "Drag & drop PDF or Word file to extract requirements"}
                    </p>
                    {forceShowUpload && proposal?.rfp && (
                      <button 
                        onClick={(e) => { e.preventDefault(); setForceShowUpload(false); }}
                        className="mt-4 px-4 py-1.5 bg-gray-800 rounded-lg text-[10px] text-gray-400 font-black uppercase hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </label>
                </div>
              )}

              <RFPAnalysisPanel 
                rfp={proposal?.rfp} 
                loading={uploadLoading} 
                onSyncPricing={handleSyncPricing}
                onReanalyze={handleReanalyze}
                reanalyzing={reanalyzing}
              />
            </section>
            
            {/* Financials Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">03</span>
                <div className="h-px flex-1 bg-gray-800/50"></div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Economic Alignment</p>
              </div>

              <ValueCostSlider
                initialValue={proposal?.totalValue || 0}
                initialCost={proposal?.totalCost || 0}
                onSync={handleSyncPrice}
                isSyncing={isSyncing}
              />
            </section>
          </div>
        </div>

        {/* Center: Editor Canvas */}
        <div className="flex-1 bg-[#050505] overflow-y-auto selection:bg-blue-500/20">
          <div className="max-w-4xl mx-auto py-12 px-8">
            <div className="mb-12 border-b border-gray-800 pb-8">
              <input
                type="text"
                className="bg-transparent border-none text-5xl font-black text-white focus:ring-0 w-full mb-3 placeholder-gray-800"
                placeholder="Proposal Title"
                value={proposal?.title}
                onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
              />
              <div className="flex items-center gap-4">
                <p className="text-blue-500 font-mono text-sm tracking-tighter">propixel.ai/p/{proposal?.slug}</p>
                <span className="text-gray-800 text-xs font-black uppercase tracking-widest">•</span>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
                  {proposal?.company?.name || "No Company"}
                </p>
              </div>
            </div>

            <EditorCanvas
              blocks={blocks}
              onReorder={setBlocks}
              onRemoveBlock={handleRemoveBlock}
              onUpdateBlockContent={handleUpdateBlockContent}
            />
          </div>
        </div>

        {/* Right Side: Block Selection (Library) */}
        {!libraryOpen && (
          <button 
            onClick={() => setLibraryOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-gray-900 border border-r-0 border-gray-800 rounded-l-2xl flex items-center justify-center group hover:bg-blue-600 transition-all shadow-2xl z-20"
            title="Open Content Library"
          >
            <span className="text-xs group-hover:scale-125 transition-transform">📚</span>
          </button>
        )}

        <div className={`${libraryOpen ? 'w-[320px]' : 'w-0'} bg-gray-950 border-l border-gray-800 overflow-hidden flex flex-col transition-all duration-300 relative`}>
          <button 
            onClick={() => setLibraryOpen(false)}
            className="absolute left-0 top-2 p-2 text-gray-500 hover:text-white transition-colors z-10"
            title="Collapse Library"
          >
            <span className="text-xs">✕</span>
          </button>
          <div className="min-w-[320px] h-full">
            <BlockSidebar rfpId={proposal?.rfpId} onAddBlock={handleAddBlock} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalEditorPage;
