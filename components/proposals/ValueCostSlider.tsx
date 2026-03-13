import React, { useState, useEffect } from "react";

interface ValueCostSliderProps {
  initialValue: number;
  initialCost: number;
  onSync: (value: number, cost: number) => Promise<void>;
  isSyncing?: boolean;
}

const ValueCostSlider: React.FC<ValueCostSliderProps> = ({
  initialValue,
  initialCost,
  onSync,
  isSyncing = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [cost, setCost] = useState(initialCost);

  useEffect(() => {
    setValue(initialValue);
    setCost(initialCost);
  }, [initialValue, initialCost]);

  const margin = value - cost;
  const marginPercentage = value > 0 ? (margin / value) * 100 : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-white">Strategic Pricing</h3>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Estimated Margin</p>
          <p className={`text-2xl font-black ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {marginPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Total Value Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Total Proposal Value</span>
            <span className="text-white font-bold">${value.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(value * 2, 50000)}
            step="500"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Total Cost Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Internal Delivery Cost</span>
            <span className="text-white font-bold">${cost.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(value, 25000)}
            step="500"
            value={cost}
            onChange={(e) => setCost(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gray-600"
          />
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Net Profit</p>
          <p className="text-xl font-bold text-gray-200">${margin.toLocaleString()}</p>
        </div>
        
        <button
          onClick={() => onSync(value, cost)}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            isSyncing 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20"
          }`}
        >
          {isSyncing ? (
            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          )}
          {isSyncing ? "Syncing..." : "Sync to HubSpot Deal"}
        </button>
      </div>
    </div>
  );
};

export default ValueCostSlider;
