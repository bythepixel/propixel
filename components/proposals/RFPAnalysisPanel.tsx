import React from "react";

interface RFPAnalysisPanelProps {
  rfp: {
    aiSummary: string | null;
    strategicAnalysis: string | null;
    complexityScore: number | null;
    rules: string | null;
    criteria: string | null;
    industry: string | null;
    goals: string | null;
    recommendedValue: number | null;
    recommendedCost: number | null;
    pricingExplanation: string | null;
    suggestedBlocks: any | null;
    missingContent: string | null;
  } | null;
  loading?: boolean;
  onSyncPricing?: (value: number, cost: number) => void;
  onReanalyze?: () => void;
  reanalyzing?: boolean;
}

const RFPAnalysisPanel: React.FC<RFPAnalysisPanelProps> = ({ rfp, loading, onSyncPricing, onReanalyze, reanalyzing }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  if (loading || reanalyzing) {
    return (
      <div className="animate-pulse space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">
            {reanalyzing ? "Re-analyzing RFP..." : "AI Strategy Engine Initializing..."}
          </span>
        </div>
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-20 bg-gray-800 rounded w-full"></div>
        <div className="h-40 bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-lg border border-dashed border-gray-700">
        <p className="text-gray-400">No RFP analyzed for this proposal yet.</p>
      </div>
    );
  }

  const suggestedBlocks = Array.isArray(rfp.suggestedBlocks) ? rfp.suggestedBlocks : [];

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="font-semibold text-white">AI Strategy Engine</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setModalOpen(true)}
            className="text-[10px] text-blue-400 hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
            title="Open comprehensive strategic breakdown"
          >
            <span className="text-xs">📜</span>
            Full Analysis
          </button>
          {onReanalyze && (
            <button 
              onClick={onReanalyze}
              className="text-[10px] text-gray-400 hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
              title="Refresh AI insights without re-uploading"
            >
              <span className="text-xs">🔄</span>
              Re-analyze
            </button>
          )}
          <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
            (rfp.complexityScore || 0) > 7 ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-900/50 text-green-200 border border-green-800'
          }`}>
            Cmplx: {rfp.complexityScore}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* Executive Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Executive Summary</h4>
            <div className="h-px flex-1 bg-gray-800"></div>
          </div>
          <p className="text-[15px] text-gray-200 leading-relaxed font-black tracking-wide">
            {rfp.aiSummary}
          </p>
        </section>

        {/* Pricing Strategy */}
        <section className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Strategy Recommendation</h4>
            {onSyncPricing && rfp.recommendedValue && (
              <button 
                onClick={() => onSyncPricing(rfp.recommendedValue!, rfp.recommendedCost || 0)}
                className="text-[10px] px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-900/40 active:scale-95"
              >
                Apply to Financials
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2 tracking-widest">Optimized Value</span>
              <span className="text-3xl font-black text-white tracking-tighter">${(rfp.recommendedValue || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2 tracking-widest">Target Cost Basis</span>
              <span className="text-3xl font-black text-gray-400 tracking-tighter">${(rfp.recommendedCost || 0).toLocaleString()}</span>
            </div>
          </div>

          {rfp.recommendedValue && rfp.recommendedCost && (
            <div className="mt-6 pt-6 border-t border-blue-500/10 relative z-10">
              <div className="flex justify-between items-end text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">
                <span>Margin Efficiency</span>
                <span className="text-blue-400 text-sm">{Math.round((rfp.recommendedValue / rfp.recommendedCost) * 100)}%</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (rfp.recommendedValue / rfp.recommendedCost) * 20)}%` }}
                ></div>
              </div>
            </div>
          )}

          {rfp.pricingExplanation && (
            <div className="mt-6 p-4 bg-black/30 rounded-2xl border border-white/5 relative z-10">
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest block mb-2">AI Pricing Logic</span>
              <p className="text-[12px] text-gray-400 leading-relaxed font-medium italic">
                {rfp.pricingExplanation}
              </p>
            </div>
          )}
        </section>

        {/* Content Strategy */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Content Strategy</h4>
            <div className="h-px flex-1 bg-gray-800"></div>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-indigo-400 block mb-3 uppercase font-black tracking-widest">Recommended Library Matches</span>
              {suggestedBlocks.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {suggestedBlocks.map((block: any, idx: number) => (
                    <span key={typeof block === 'object' ? block.id : (block + idx)} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-500/20 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {typeof block === 'object' ? block.title || `Block #${block.id}` : `Block #${block}`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">No existing library matches identified.</p>
              )}
            </div>

            {rfp.missingContent && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">⚠️</span>
                  <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Structural Gaps Identified</span>
                </div>
                <p className="text-[13px] text-amber-200/70 leading-relaxed font-medium">
                  {rfp.missingContent}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Strategic Intelligence */}
        <div className="grid grid-cols-1 gap-8">
          {rfp.goals && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Strategic Goals</h4>
                <div className="h-px flex-1 bg-gray-800"></div>
              </div>
              <p className="text-[14px] text-gray-400 leading-relaxed font-medium">{rfp.goals}</p>
            </section>
          )}

          {rfp.criteria && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Evaluation Criteria</h4>
                <div className="h-px flex-1 bg-gray-800"></div>
              </div>
              <p className="text-[14px] text-gray-400 leading-relaxed font-medium">{rfp.criteria}</p>
            </section>
          )}
        </div>

        {rfp.rules && (
          <section className="bg-gray-950 p-5 rounded-2xl border border-gray-800 border-dashed">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3">Submission Compliance</h4>
            <div className="flex gap-3">
              <span className="text-lg text-gray-700">⚖️</span>
              <p className="text-[13px] text-gray-500 leading-relaxed italic">{rfp.rules}</p>
            </div>
          </section>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-[80vw] h-[80vh] bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-black/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <span className="text-xl">📜</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Comprehensive Strategic Analysis</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Advanced RFP Decomposition</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:bg-red-900/20 hover:border-red-900/50 transition-all"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12">
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Phase 01</span>
                    <h4 className="text-2xl font-black text-white">Requirement Matrix</h4>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                      {rfp.strategicAnalysis || "No detailed analysis available. Try re-analyzing this RFP."}
                    </div>
                  </div>
                </section>
                
                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-800">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Strategic Goals</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">{rfp.goals}</p>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Evaluation Criteria</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">{rfp.criteria}</p>
                  </section>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 bg-black/30 flex justify-center">
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                AI GEN-STRAT ENGINE V2.0 • PROPIXEL ANALYTICS
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFPAnalysisPanel;
