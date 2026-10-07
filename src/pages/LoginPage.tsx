import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { Flame, Shield, Users, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, quickLogin, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {}
  };

  const handleQuickDemo = async (demoEmail: string) => {
    try {
      await quickLogin(demoEmail);
      onSuccess();
    } catch (err) {}
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
            Access franchise bidding desk or commissioner controls.
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@franchise.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
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

        {/* 1-Click Quick Demo Sign-In */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold text-center mb-3">
            Instant Demo Sign-In
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@demo.com')}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Auctioneer Admin</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">admin@demo.com</span>
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
    </div>
  );
};
