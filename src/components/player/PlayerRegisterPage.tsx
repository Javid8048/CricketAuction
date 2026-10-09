import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Camera, CheckCircle2, Copy, Check, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { formatRupees } from '../../utils/currency';

interface PlayerRegisterPageProps {
  onBackToArena: () => void;
}

export const PlayerRegisterPage: React.FC<PlayerRegisterPageProps> = ({ onBackToArena }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    place: '',
    phone: '',
    role: 'All-Rounder',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    basePrice: 100,
    profileImage: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPlayer, setRegisteredPlayer] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedSNo, setEstimatedSNo] = useState<number>(1);

  // Fetch current player count to show next S.No
  useEffect(() => {
    async function fetchNextSNo() {
      try {
        const players = await api.getPlayers();
        if (Array.isArray(players) && players.length > 0) {
          const maxSNo = Math.max(...players.map((p) => p.sNo || 0));
          setEstimatedSNo(maxSNo + 1);
        } else {
          setEstimatedSNo(1);
        }
      } catch (e) {
        setEstimatedSNo(1);
      }
    }
    fetchNextSNo();
  }, []);

  // Auto-calculate age from DOB
  const handleDobChange = (dobValue: string) => {
    let calculatedAge = '';
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age > 0 && age < 80) {
        calculatedAge = String(age);
      }
    }
    setFormData((prev) => ({
      ...prev,
      dob: dobValue,
      age: calculatedAge || prev.age,
    }));
  };

  // Image Upload handler (supports gallery or camera on phone)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href.split('#')[0] + '#register';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Player Name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Default placeholder if no image uploaded
      const finalImage =
        formData.profileImage ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

      const payload = {
        ...formData,
        profileImage: finalImage,
        age: Number(formData.age) || 22,
        basePrice: 100,
      };

      const res = await api.registerPlayerPublic(payload);
      setRegisteredPlayer(res.player);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 px-3 sm:px-6 bg-[#090d16] text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        {/* Share Link Banner */}
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-transparent border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Public Tournament Registration Link</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all text-[11px] shadow-sm shadow-amber-500/20 active:scale-95 shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>

        {/* Success Screen */}
        {registeredPlayer ? (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              Registration Confirmed
            </span>

            <h2 className="text-2xl font-black text-white mt-3 mb-1">
              Welcome, {registeredPlayer.name}!
            </h2>

            <div className="inline-block mt-2 mb-4 px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/40 shadow-inner">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Your Serial Number:</span>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-wider">
                S.No #{registeredPlayer.sNo}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-white font-semibold">{registeredPlayer.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Batting / Bowling:</span>
                <span className="text-white font-semibold">{registeredPlayer.battingStyle} • {registeredPlayer.bowlingStyle}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Place / Location:</span>
                <span className="text-white font-semibold">{registeredPlayer.place || 'Not provided'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Starting Base Price:</span>
                <span className="text-amber-400 font-mono font-bold">{formatRupees(registeredPlayer.basePrice)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setRegisteredPlayer(null);
                  setFormData({
                    name: '',
                    dob: '',
                    age: '',
                    place: '',
                    phone: '',
                    role: 'All-Rounder',
                    battingStyle: 'Right-hand bat',
                    bowlingStyle: 'Right-arm medium',
                    basePrice: 100,
                    profileImage: '',
                  });
                  setImagePreview('');
                  setEstimatedSNo((prev) => prev + 1);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Register Another Player
              </button>
              <button
                type="button"
                onClick={onBackToArena}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
              >
                Go to Live Auction Arena
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-amber-400" />
                  Player Registration
                </h1>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                  Next S.No: #{estimatedSNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fill in your cricket profile to enter the live tournament auction pool. Starting BID: <strong className="text-amber-400">₹100</strong>.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload with mobile camera support */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="relative w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shrink-0 group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <label className="block text-xs font-bold text-white mb-1">
                    Profile Photo / Selfie
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Upload from your gallery or take a picture with your phone camera.
                  </p>
                  <label className="inline-block px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors active:scale-95">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* DOB & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="65"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Place / City & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Place / Native City <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.place}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      placeholder="e.g. Chennai, Madurai"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone / WhatsApp Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Cricket Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                        formData.role === role
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batting & Bowling Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batting Style
                  </label>
                  <select
                    value={formData.battingStyle}
                    onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Right-hand bat">Right-hand bat</option>
                    <option value="Left-hand bat">Left-hand bat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bowling Style
                  </label>
                  <select
                    value={formData.bowlingStyle}
                    onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Right-arm fast">Right-arm fast</option>
                    <option value="Right-arm medium">Right-arm medium</option>
                    <option value="Right-arm offbreak">Right-arm off-spin</option>
                    <option value="Right-arm leg-spin">Right-arm leg-spin</option>
                    <option value="Left-arm fast">Left-arm fast</option>
                    <option value="Left-arm orthodox">Left-arm spin</option>
                    <option value="None">None / Pure Batter</option>
                  </select>
                </div>
              </div>

              {/* Base Price Note */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Auction Starting Base Price:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">₹100</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onBackToArena}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 order-1 sm:order-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Registering Player...' : 'Submit Registration'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
