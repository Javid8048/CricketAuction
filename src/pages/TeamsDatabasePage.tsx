import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Team } from '../types';
import { formatRupees } from '../utils/currency';
import { Users, Globe, Trophy, Shield, Plus, Edit2, Star, Phone, MapPin, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { TeamFormModal } from '../components/admin/TeamFormModal';
import { IconPlayerModal } from '../components/admin/IconPlayerModal';

export const TeamsDatabasePage: React.FC = () => {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [selectedTeamIdForIcons, setSelectedTeamIdForIcons] = useState<string | undefined>(undefined);

  const isAdmin = user?.role === 'ADMIN';

  const loadTeams = () => {
    setLoading(true);
    api
      .getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleEditTeam = (team: Team) => {
    setTeamToEdit(team);
    setIsTeamModalOpen(true);
  };

  const handleOpenAddTeam = () => {
    setTeamToEdit(null);
    setIsTeamModalOpen(true);
  };

  const handleManageIcons = (teamId: string) => {
    setSelectedTeamIdForIcons(teamId);
    setIsIconModalOpen(true);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400">Loading franchises...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            PARTICIPATING FRANCHISES ({teams.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered franchises competing with purse limit ₹15,000 and max 12 members squad.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddTeam}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Franchise
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {teams.map((t) => {
          const pursePercent = Math.max(0, Math.min(100, (t.remainingPurse / t.totalPurse) * 100));
          const iconCount = t.squad?.filter((sp) => sp.isIcon || sp.player?.isIcon).length || 0;

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
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: t.primaryColor }}
                    >
                      {t.logoText || t.shortName?.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base font-display">{t.name}</h3>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{t.shortName}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleEditTeam(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit Franchise Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Owner & Contact details if present */}
                {(t.ownerName || t.phone || t.address) && (
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mb-3 space-y-1 text-[11px] text-slate-300">
                    {t.ownerName && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-400">Owner:</span>
                        <span className="text-white font-semibold truncate">{t.ownerName}</span>
                      </div>
                    )}
                    {t.phone && (
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{t.phone}</span>
                      </div>
                    )}
                    {t.address && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{t.address}</span>
                      </div>
                    )}
                  </div>
                )}

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

                {/* Squad & Icon Statistics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Users className="w-3.5 h-3.5" />
                      Squad:
                    </span>
                    <span className="font-bold text-white">
                      {t.squadSize ?? 0} / {t.maxSquadSize}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      Icons:
                    </span>
                    <span className="font-bold text-yellow-300">
                      {iconCount} / 2
                    </span>
                  </div>
                </div>

                {/* Squad Player List Preview */}
                <div className="text-xs mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Current Squad ({t.squad?.length || 0})
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleManageIcons(t.id)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>Manage Icons</span>
                      </button>
                    )}
                  </div>

                  {t.squad && t.squad.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {t.squad.map((sp: any) => {
                        const isIconPlayer = sp.isIcon || sp.player?.isIcon;
                        return (
                          <div
                            key={sp.id}
                            className={`flex items-center justify-between px-2 py-1 rounded text-[11px] ${
                              isIconPlayer
                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                                : 'bg-slate-900/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              {isIconPlayer && <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 shrink-0" />}
                              {sp.player?.name}
                            </span>
                            <span className="font-mono text-amber-400 font-bold shrink-0 ml-1">
                              {formatRupees(sp.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 italic py-1">No players signed yet.</div>
                  )}
                </div>
              </div>

              {/* Admin Quick Action Button on Footer of Card */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleManageIcons(t.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>Assign Icon (₹2,500)</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Team Form Modal (Create or Edit) */}
      <TeamFormModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          loadTeams();
        }}
        teamToEdit={teamToEdit}
      />

      {/* Admin Icon Player Modal */}
      <IconPlayerModal
        isOpen={isIconModalOpen}
        onClose={() => {
          setIsIconModalOpen(false);
          loadTeams();
        }}
        selectedTeamId={selectedTeamIdForIcons}
      />
    </div>
  );
};
