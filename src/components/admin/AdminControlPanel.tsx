import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, CheckCircle2, XCircle, RotateCcw, SkipForward, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useAuctionStore } from '../../store/auction.store';
import { api } from '../../services/api';
import { Player } from '../../types';
import { formatRupees } from '../../utils/currency';

export const AdminControlPanel: React.FC = () => {
  const { state } = useAuctionStore();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const auction = state?.auction;

  useEffect(() => {
    api.getPlayers().then(setAllPlayers).catch(console.error);
  }, [state?.auction?.activePlayerId]);

  const handleAction = async (actionFn: () => Promise<any>, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setLoadingAction(true);
    try {
      await actionFn();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManualSelect = async () => {
    if (!selectedPlayerId) return;
    handleAction(() => api.selectPlayer(selectedPlayerId));
  };

  return (
    <div className="bg-[#121724] border border-amber-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
        <Shield className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-extrabold text-white font-display uppercase tracking-wider">
          AUCTIONEER COMMAND DESK
        </h3>
        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold ml-auto">
          COMMISSIONER ACCESS
        </span>
      </div>

      {/* Manual Player Selection */}
      <div className="mb-6 bg-[#161d2e] p-4 rounded-xl border border-slate-800">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Introduce Player to Auction Block
        </label>
        <div className="flex gap-2">
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Choose player from catalog --</option>
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.country} • {p.role} • {formatRupees(p.basePrice)}) [{p.status}]
              </option>
            ))}
          </select>
          <button
            onClick={handleManualSelect}
            disabled={!selectedPlayerId || loadingAction}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 disabled:opacity-40"
          >
            Put on Block
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* START / PAUSE */}
        {auction?.status === 'ACTIVE' ? (
          <button
            onClick={() => handleAction(() => api.pauseAuction())}
            disabled={loadingAction}
            className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
          >
            <Pause className="w-5 h-5 text-amber-400" />
            <span>PAUSE AUCTION</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction(() => api.startAuction())}
            disabled={loadingAction}
            className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
          >
            <Play className="w-5 h-5 text-emerald-400" />
            <span>{auction?.status === 'PAUSED' ? 'RESUME' : 'START AUCTION'}</span>
          </button>
        )}

        {/* START BIDDING TIMER */}
        <button
          onClick={() => handleAction(() => api.startBidding())}
          disabled={loadingAction || !auction?.activePlayerId}
          className="p-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <Play className="w-5 h-5 text-sky-400" />
          <span>START BID TIMER</span>
        </button>

        {/* CONFIRM SOLD */}
        <button
          onClick={() => handleAction(() => api.sellPlayer(), 'Manually confirm player as SOLD to highest bidder?')}
          disabled={loadingAction || !auction?.activePlayerId}
          className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>SELL PLAYER</span>
        </button>

        {/* MARK UNSOLD */}
        <button
          onClick={() => handleAction(() => api.markUnsold(), 'Mark current player as UNSOLD?')}
          disabled={loadingAction || !auction?.activePlayerId}
          className="p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <XCircle className="w-5 h-5 text-rose-400" />
          <span>MARK UNSOLD</span>
        </button>

        {/* NEXT PLAYER */}
        <button
          onClick={() => handleAction(() => api.nextPlayer())}
          disabled={loadingAction}
          className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
        >
          <FastForward className="w-5 h-5 text-purple-400" />
          <span>NEXT PLAYER</span>
        </button>

        {/* SKIP PLAYER */}
        <button
          onClick={() => handleAction(() => api.skipPlayer(), 'Skip this player for now?')}
          disabled={loadingAction || !auction?.activePlayerId}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <SkipForward className="w-5 h-5 text-slate-400" />
          <span>SKIP PLAYER</span>
        </button>

        {/* RE-AUCTION UNSOLD */}
        <button
          onClick={() => handleAction(() => api.reauctionUnsold(), 'Initiate Round 2 for all UNSOLD players?')}
          disabled={loadingAction}
          className="p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-5 h-5 text-blue-400" />
          <span>RE-AUCTION UNSOLD</span>
        </button>

        {/* RESET AUCTION */}
        <button
          onClick={() =>
            handleAction(
              () => api.resetAuction(),
              'WARNING: This will reset all team budgets, erase all bids, and revert all 50 players back to UPCOMING. Proceed?'
            )
          }
          disabled={loadingAction}
          className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <span>RESET AUCTION</span>
        </button>
      </div>
    </div>
  );
};
