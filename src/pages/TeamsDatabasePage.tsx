import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Team } from '../types';
import { formatRupees } from '../utils/currency';
import { Users, Globe, Trophy, Shield } from 'lucide-react';

export const TeamsDatabasePage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400">Loading franchises...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          PARTICIPATING FRANCHISES (8)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          The 8 franchises competing in the Premier Cricket Mega Auction arena.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {teams.map((t) => {
          const pursePercent = Math.max(0, Math.min(100, (t.remainingPurse / t.totalPurse) * 100));

          return (
            <div
              key={t.id}
              className="bg-[#121724] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              {/* Team Accent Top Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: t.primaryColor }}
              />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: t.primaryColor }}
                  >
                    {t.logoText}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base font-display">{t.name}</h3>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{t.shortName}</span>
                  </div>
                </div>

                {/* Purse Information */}
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">REMAINING PURSE</span>
                    <span className="font-black font-mono text-amber-400">{formatRupees(t.remainingPurse)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pursePercent}%`,
                        backgroundColor: t.primaryColor,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                    <span>Spent: {formatRupees(t.totalPurse - t.remainingPurse)}</span>
                    <span>Total: {formatRupees(t.totalPurse)}</span>
                  </div>
                </div>

                {/* Squad Statistics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Squad:
                    </span>
                    <span className="font-bold text-white">
                      {t.squadSize ?? 0} / {t.maxSquadSize}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      Overseas:
                    </span>
                    <span className="font-bold text-cyan-300">
                      {t.overseasCount ?? 0} / {t.maxOverseas}
                    </span>
                  </div>
                </div>

                {/* Squad Player List Preview */}
                <div className="text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Current Squad Players ({t.squad?.length || 0})
                  </span>
                  {t.squad && t.squad.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {t.squad.map((sp: any) => (
                        <div
                          key={sp.id}
                          className="flex items-center justify-between bg-slate-900/40 px-2 py-1 rounded text-[11px] text-slate-300"
                        >
                          <span className="truncate">{sp.player.name}</span>
                          <span className="font-mono text-amber-400 font-bold shrink-0">
                            {formatRupees(sp.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 italic py-1">No players signed yet.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
