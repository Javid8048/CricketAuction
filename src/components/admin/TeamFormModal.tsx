import React, { useState } from 'react';
import { Shield, X, Phone, MapPin, User, Coins, Users } from 'lucide-react';
import { Team } from '../../types';
import { api } from '../../services/api';
import { useAuctionStore } from '../../store/auction.store';
import { formatRupees } from '../../utils/currency';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamToEdit?: Team | null;
}

export const TeamFormModal: React.FC<TeamFormModalProps> = ({ isOpen, onClose, teamToEdit }) => {
  const { showToast, initState } = useAuctionStore();

  const [formData, setFormData] = useState({
    name: teamToEdit?.name || '',
    shortName: teamToEdit?.shortName || '',
    ownerName: teamToEdit?.ownerName || '',
    phone: teamToEdit?.phone || '',
    address: teamToEdit?.address || '',
    primaryColor: teamToEdit?.primaryColor || '#3B82F6',
    secondaryColor: teamToEdit?.secondaryColor || '#1E40AF',
    totalPurse: teamToEdit?.totalPurse !== undefined ? teamToEdit.totalPurse : 15000,
    maxSquadSize: teamToEdit?.maxSquadSize !== undefined ? teamToEdit.maxSquadSize : 12,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Team Name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (teamToEdit) {
        await api.updateTeam(teamToEdit.id, formData);
        showToast(`Team ${formData.name} updated successfully!`, 'success');
      } else {
        await api.createTeam(formData);
        showToast(`Team ${formData.name} created successfully!`, 'success');
      }
      await initState();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save team details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {teamToEdit ? `Edit Team: ${teamToEdit.name}` : 'Add New Franchise / Team'}
              </h3>
              <p className="text-xs text-slate-400">Configure team profile, owner details, purse, and squad limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Team Name & Short Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Team Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Coastal Kings"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Name (Initials)
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                placeholder="e.g. CK"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Vikram Merchant"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Address / Locality
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. South Zone, Chennai"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Purse & Squad Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Starting Purse (₹)
              </label>
              <input
                type="number"
                required
                value={formData.totalPurse}
                onChange={(e) => setFormData({ ...formData, totalPurse: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">{formatRupees(formData.totalPurse)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Max Squad Limit
              </label>
              <input
                type="number"
                min="5"
                max="25"
                required
                value={formData.maxSquadSize}
                onChange={(e) => setFormData({ ...formData, maxSquadSize: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">{formData.maxSquadSize} Members Maximum</span>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : teamToEdit ? 'Save Changes' : 'Create Franchise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
