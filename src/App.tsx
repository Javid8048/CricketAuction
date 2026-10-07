import React, { useEffect, useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { SoldUnsoldBanner } from './components/auction/SoldUnsoldBanner';
import { LiveAuctionPage } from './pages/LiveAuctionPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import { PlayersDatabasePage } from './pages/PlayersDatabasePage';
import { TeamsDatabasePage } from './pages/TeamsDatabasePage';
import { AuctionHistoryPage } from './pages/AuctionHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { useAuctionStore } from './store/auction.store';
import { useAuthStore } from './store/auth.store';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('arena');
  const { initState, initSocketListeners } = useAuctionStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    initState();
    initSocketListeners();
  }, [checkAuth, initState, initSocketListeners]);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Broadcast Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Main Screen Content */}
      <main className="flex-1 pb-12">
        {currentTab === 'arena' && <LiveAuctionPage />}
        {currentTab === 'players' && <PlayersDatabasePage />}
        {currentTab === 'teams' && <TeamsDatabasePage />}
        {currentTab === 'admin-dashboard' && <AdminDashboardPage />}
        {currentTab === 'team-dashboard' && <TeamDashboardPage />}
        {currentTab === 'history' && <AuctionHistoryPage />}
        {currentTab === 'login' && <LoginPage onSuccess={() => setCurrentTab('arena')} />}
      </main>

      {/* Live Overlays & Toasts */}
      <SoldUnsoldBanner />
      <Toast />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#07090e] py-4 text-center text-xs text-slate-500 font-mono">
        CRICKET AUCTION ARENA • Production Franchise Bidding Simulator • Real-time WebSocket Engine
      </footer>
    </div>
  );
}

export default App;
