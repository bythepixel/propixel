import React, { useState, useEffect } from "react";

interface Block {
  id: number;
  title: string;
  content: string;
}

interface Recommendation {
  blockId: number;
  reason: string;
}

interface BlockSidebarProps {
  rfpId?: number | null;
  onAddBlock: (block: Block) => void;
}

const BlockSidebar: React.FC<BlockSidebarProps> = ({ rfpId, onAddBlock }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlocks();
    if (rfpId) {
      fetchRecommendations();
    }
  }, [rfpId]);

  const fetchBlocks = async () => {
    try {
      const res = await fetch("/api/blocks");
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`/api/proposals/recommendations?rfpId=${rfpId}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const getRecommendation = (blockId: number) => {
    return recommendations.find((r) => r.blockId === blockId);
  };

  const filteredBlocks = blocks.filter((block) =>
    block.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort blocks: recommendations first
  const sortedBlocks = [...filteredBlocks].sort((a, b) => {
    const aRec = getRecommendation(a.id);
    const bRec = getRecommendation(b.id);
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-800 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-bold mb-4">Content Library</h3>
        <input
          type="text"
          placeholder="Search blocks..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedBlocks.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">No blocks found.</p>
        ) : (
          sortedBlocks.map((block) => {
            const rec = getRecommendation(block.id);
            return (
              <div
                key={block.id}
                className={`group p-3 rounded-lg border cursor-pointer transition-all ${
                  rec
                    ? "border-blue-900 bg-blue-900/10 hover:bg-blue-900/20"
                    : "border-gray-800 bg-gray-800/40 hover:bg-gray-800/60"
                }`}
                onClick={() => onAddBlock(block)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white">
                    {block.title}
                  </h4>
                  {rec && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                      AI recommended
                    </span>
                  )}
                </div>
                {rec && (
                  <p className="text-[11px] text-blue-300 italic mb-2 leading-tight">
                    "{rec.reason}"
                  </p>
                )}
                <p className="text-xs text-gray-400 line-clamp-2">
                  {block.content.replace(/<[^>]*>?/gm, "")}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BlockSidebar;
