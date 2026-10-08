import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Users, Radio, UserCheck, ChevronDown, Trophy, LogOut, Flame, Server } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useAuctionStore } from '../../store/auction.store';
import { formatRupees } from '../../utils/currency';
import { getBackendUrl } from '../../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPlayerModal?: (playerId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, quickLogin } = useAuthStore();
  const { state, isConnected, soundMuted, toggleSound } = useAuctionStore();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getBackendUrl());

  const auctionStatus = state?.auction?.status || 'IDLE';

  // Demo accounts options for instant testing
  const demoAccounts = [
    { label: 'Admin (Auctioneer)', email: 'admin@demo.com', role: 'ADMIN', color: '#f59e0b' },
    { label: 'Coastal Kings (CK)', email: 'team1@demo.com', role: 'TEAM', color: '#eab308' },
    { label: 'Capital Warriors (CW)', email: 'team2@demo.com', role: 'TEAM', color: '#ef4444' },
    { label: 'Southern Strikers (SS)', email: 'team3@demo.com', role: 'TEAM', color: '#06b6d4' },
    { label: 'Western Titans (WT)', email: 'team4@demo.com', role: 'TEAM', color: '#8b5cf6' },
    { label: 'Eastern Challengers (EC)', email: 'team5@demo.com', role: 'TEAM', color: '#10b981' },
    { label: 'Northern Royals (NR)', email: 'team6@demo.com', role: 'TEAM', color: '#ec4899' },
  ];

  const userTeam = state?.teams.find((t) => t.id === user?.teamId);

  return (
    <header className="sticky top-0 z-40 bg-[#0c101a]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('arena')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-wider text-white">
                  CRICKET AUCTION <span className="text-amber-400">ARENA</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {isConnected ? 'LIVE FEED' : 'CONNECTING...'}
                </span>
                <span>•</span>
                <span
                  className={`font-semibold uppercase tracking-wider ${
                    auctionStatus === 'ACTIVE'
                      ? 'text-emerald-400'
                      : auctionStatus === 'PAUSED'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {auctionStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 text-sm font-medium">
            <button
              onClick={() => onSelectTab('arena')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                currentTab === 'arena'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4 text-amber-400" />
              Live Arena
            </button>

            <button
              onClick={() => onSelectTab('players')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                currentTab === 'players'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Players (50)
            </button>

            <button
              onClick={() => onSelectTab('teams')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                currentTab === 'teams'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Franchises (8)
            </button>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => onSelectTab('admin-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentTab === 'admin-dashboard'
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Analytics
              </button>
            )}

            {user?.role === 'TEAM' && (
              <button
                onClick={() => onSelectTab('team-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentTab === 'team-dashboard'
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-cyan-400" />
                My Squad
              </button>
            )}

            <button
              onClick={() => onSelectTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                currentTab === 'history'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Audit History
            </button>
          </nav>
        </div>

        {/* Right Side: Demo Account Switcher, Sound, User Info */}
        <div className="flex items-center gap-3">
          {/* Server / Backend Config */}
          <button
            onClick={() => setShowServerModal(true)}
            title="Backend Server Settings"
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:bg-slate-700/80 transition-colors border border-slate-700/60"
          >
            <Server className="w-4 h-4 text-amber-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:bg-slate-700/80 transition-colors border border-slate-700/60"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Demo Role</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Quick Switch Account
                </div>
                <div className="space-y-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={async () => {
                        await quickLogin(acc.email);
                        setShowDemoMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: acc.color }}
                        />
                        <span className="font-medium text-slate-200">{acc.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{acc.role}</span>
                    </button>
                  ))}

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowDemoMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-400 text-left transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Switch to Spectator (Logged Out)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Session / Login Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {user.role === 'TEAM' && userTeam ? (
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: userTeam.primaryColor }}
                    />
                    <span className="text-xs font-bold text-white">{userTeam.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    Purse: {formatRupees(userTeam.remainingPurse)}
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-amber-300">AUCTIONEER ADMIN</span>
                  <span className="text-[11px] text-slate-400 font-mono">Commission Control</span>
                </div>
              )}

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('login')}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Backend Server Settings Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Live Backend Connection</h3>
                <p className="text-xs text-slate-400">Configure WebSocket & REST API endpoint</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              GitHub Pages hosts the frontend client. To sync bids live across multiple devices/tabs in real-time, connect your deployed backend URL (Render, Railway, Codespaces, or localhost).
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Backend API & WebSocket URL
                </label>
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="e.g. https://cricket-auction-backend.onrender.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Quick options:</div>
                <div>• <code className="text-amber-400">Render Free Cloud</code>: Connect your Render web service URL</div>
                <div>• <code className="text-cyan-400">http://localhost:5000</code>: Local development server</div>
                <div>• <code className="text-emerald-400">Standalone Mode</code>: Runs 100% in browser with smart simulation</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('caa_backend_url');
                  localStorage.removeItem('caa_backend_url');
                  window.location.reload();
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (serverUrlInput.trim()) {
                      sessionStorage.setItem('caa_backend_url', serverUrlInput.trim());
                      localStorage.setItem('caa_backend_url', serverUrlInput.trim());
                    } else {
                      sessionStorage.removeItem('caa_backend_url');
                      localStorage.removeItem('caa_backend_url');
                    }
                    setShowServerModal(false);
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
