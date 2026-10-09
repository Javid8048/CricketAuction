import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { Flame, Shield, Users, Lock, User, ArrowRight, KeyRound, UserPlus } from 'lucide-react';
import { api } from '../services/api';

interface LoginPageProps {
  onSuccess: () => void;
  onOpenRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onOpenRegister }) => {
  const { login, quickLogin, isLoading, error } = useAuthStore();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password reset modal inside login
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetStatus, setResetStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(usernameOrEmail.trim(), password);
      onSuccess();
    } catch (err) {}
  };

  const handleQuickDemo = async (demoIdentifier: string) => {
    try {
      await quickLogin(demoIdentifier);
      onSuccess();
    } catch (err) {}
  };

  const handleAdminFill = () => {
    setUsernameOrEmail('KhaderMeeran');
    setPassword('Admin@123');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 4) {
      setResetStatus({ text: 'New password must be at least 4 characters.', error: true });
      return;
    }
    if (newPass !== confirmPass) {
      setResetStatus({ text: 'Passwords do not match.', error: true });
      return;
    }

    setIsResetting(true);
    setResetStatus(null);
    try {
      await api.resetPassword(newPass, currentPass);
      setResetStatus({ text: 'Admin password updated successfully! Please sign in with your new password.', error: false });
      setTimeout(() => {
        setShowResetModal(false);
        setPassword(newPass);
      }, 1500);
    } catch (err: any) {
      setResetStatus({ text: err.message || 'Failed to update password', error: true });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#121724] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glowing aura */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
            <Flame className="w-7 h-7 text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">SIGN IN TO ARENA</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access tournament commissioner desk or franchise team desk.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="KhaderMeeran or team1@demo.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                Reset Admin Password
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Authenticating...' : 'Enter Auction Arena'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Public Player Registration Link */}
        {onOpenRegister && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Are you a Cricketer wanting to enter the draft?</span>
            </div>
            <button
              type="button"
              onClick={onOpenRegister}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
            >
              Register Here
            </button>
          </div>
        )}

        {/* Quick 1-Click Credentials Sign-In */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold text-center mb-3">
            Quick 1-Click Sign-In
          </div>

          <div className="space-y-2">
            {/* KhaderMeeran Admin Button */}
            <button
              type="button"
              onClick={handleAdminFill}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>KhaderMeeran (Admin)</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80">Admin@123 (Fill)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('team1@demo.com')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Coastal Kings (CK)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">team1@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('team2@demo.com')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Capital Warriors (CW)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">team2@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => onSuccess()}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Continue as Spectator (No Login Required)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                <p className="text-xs text-slate-400">Update password for KhaderMeeran</p>
              </div>
            </div>

            {resetStatus && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-medium ${
                  resetStatus.error
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {resetStatus.text}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Password (Optional)
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Admin@123 (if known)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {isResetting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
