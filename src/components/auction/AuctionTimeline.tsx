import React from 'react';
import { History, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { useAuctionStore } from '../../store/auction.store';
import { formatRupees } from '../../utils/currency';

export const AuctionTimeline: React.FC = () => {
  const { state } = useAuctionStore();

  const recentBids = state?.recentBids || [];

  return (
    <div className="bg-[#121724]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md mt-4">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
            LIVE BID LOG & TIMELINE
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">LATEST BIDS IN ARENA</span>
      </div>

      {recentBids.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 italic">
          No bids recorded for current player lot yet.
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
          {recentBids.slice(0, 10).map((bid, idx) => (
            <div
              key={bid.id || idx}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                idx === 0
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-[#161d2e] border-slate-800 text-slate-300'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: bid.team?.primaryColor || '#f59e0b' }}
              />
              <span className="font-bold text-white truncate max-w-[120px]">
                {bid.team?.shortName || bid.team?.name}
              </span>
              <span className="text-amber-400 font-extrabold">{formatRupees(bid.amount)}</span>
              {idx === 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-sans font-bold">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
