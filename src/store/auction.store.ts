import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { AuctionState, Player, Team, Bid } from '../types';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { sound } from '../utils/sound';
import { INITIAL_TEAMS, INITIAL_PLAYERS } from '../data/initial-data';
import { getMinBidIncrement } from '../utils/currency';

interface SoldOverlay {
  player: Player;
  winningTeam: Team;
  finalPrice: number;
  formattedPrice: string;
}

interface UnsoldOverlay {
  player: Player;
  basePrice: number;
  formattedBasePrice: string;
}

interface AuctionStore {
  state: AuctionState | null;
  secondsLeft: number;
  isTimerWarning: boolean;
  isTimerUrgent: boolean;
  isConnected: boolean;
  isStandaloneMode: boolean;
  isBidding: boolean;
  lastBidFlash: boolean;
  soldOverlay: SoldOverlay | null;
  unsoldOverlay: UnsoldOverlay | null;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  soundMuted: boolean;

  // Actions
  initState: () => Promise<void>;
  initSocketListeners: () => void;
  placeBid: (amount?: number, teamId?: string) => Promise<void>;
  dismissOverlay: () => void;
  toggleSound: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  startStandaloneTimer: () => void;
  stopStandaloneTimer: () => void;
  adminActionStandalone: (action: string, payload?: any) => Promise<void>;
}

let standaloneInterval: any = null;

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  state: null,
  secondsLeft: 10,
  isTimerWarning: false,
  isTimerUrgent: false,
  isConnected: false,
  isStandaloneMode: false,
  isBidding: false,
  lastBidFlash: false,
  soldOverlay: null,
  unsoldOverlay: null,
  toastMessage: null,
  soundMuted: false,

  showToast: (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    set({ toastMessage: { text, type } });
    setTimeout(() => {
      if (get().toastMessage?.text === text) {
        set({ toastMessage: null });
      }
    }, 4000);
  },

  dismissOverlay: () => {
    set({ soldOverlay: null, unsoldOverlay: null });
  },

  toggleSound: () => {
    const next = !get().soundMuted;
    sound.enabled = !next;
    set({ soundMuted: next });
  },

  startStandaloneTimer: () => {
    if (standaloneInterval) clearInterval(standaloneInterval);
    standaloneInterval = setInterval(() => {
      const { secondsLeft, state } = get();
      if (!state || state.auction.status !== 'ACTIVE') return;

      const nextSec = secondsLeft - 1;
      set({
        secondsLeft: nextSec,
        isTimerWarning: nextSec <= 5 && nextSec > 0,
        isTimerUrgent: nextSec <= 3 && nextSec > 0,
      });

      if (nextSec === 5 || nextSec === 4) sound.playTimerTick();
      if (nextSec <= 3 && nextSec > 0) sound.playTimerUrgent();

      if (nextSec <= 0) {
        clearInterval(standaloneInterval);
        standaloneInterval = null;
        if (state.highestBidTeam) {
          get().adminActionStandalone('sell');
        } else {
          get().adminActionStandalone('unsold');
        }
      }
    }, 1000);
  },

  stopStandaloneTimer: () => {
    if (standaloneInterval) {
      clearInterval(standaloneInterval);
      standaloneInterval = null;
    }
  },

  initState: async () => {
    try {
      const data = await api.getCurrentAuction();
      set({
        state: data,
        secondsLeft: data.auction?.secondsLeft ?? 10,
        isConnected: true,
        isStandaloneMode: false,
      });
    } catch (err: any) {
      console.warn('Backend server offline. Enabling Standalone Live Simulation Engine on GitHub Pages!');
      // Initialize standalone client-side engine with rich teams and players
      const activeP = INITIAL_PLAYERS[0];
      const defaultState: AuctionState = {
        auction: {
          id: 'auction-mega-2026',
          name: 'Premier Cricket Mega Auction 2026',
          status: 'ACTIVE',
          currentRound: 1,
          defaultTimerSec: 10,
          activePlayerId: activeP.id,
          activePlayerPrice: activeP.basePrice,
          highestBidTeamId: null,
          secondsLeft: 10,
        },
        activePlayer: activeP,
        highestBidTeam: null,
        currentBid: activeP.basePrice,
        teams: INITIAL_TEAMS,
        recentBids: [],
        minIncrement: getMinBidIncrement(activeP.basePrice),
      };

      set({
        state: defaultState,
        secondsLeft: 10,
        isConnected: true, // Connected to internal simulation engine
        isStandaloneMode: true,
      });

      get().startStandaloneTimer();
    }
  },

  initSocketListeners: () => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      set({ isConnected: true, isStandaloneMode: false });
    });

    socket.on('disconnect', () => {
      if (!get().isStandaloneMode) {
        set({ isConnected: false });
      }
    });

    socket.on('auction:init', (data: AuctionState) => {
      set({
        state: data,
        secondsLeft: data.auction?.secondsLeft ?? 10,
        isConnected: true,
        isStandaloneMode: false,
      });
    });

    socket.on('auction:started', (data: AuctionState) => {
      set({ state: data });
      get().showToast('Auction started!', 'success');
    });

    socket.on('auction:paused', (data: AuctionState) => {
      set({ state: data });
      get().showToast('Auction paused by admin', 'info');
    });

    socket.on('auction:resumed', (data: AuctionState) => {
      set({ state: data });
      get().showToast('Auction resumed', 'info');
    });

    socket.on('auction:player', (data: AuctionState) => {
      set({
        state: data,
        secondsLeft: data.auction?.secondsLeft ?? 10,
        soldOverlay: null,
        unsoldOverlay: null,
      });
      get().showToast(`Up next: ${data.activePlayer?.name}`, 'info');
    });

    socket.on('auction:timer', (data: { secondsLeft: number; warning: boolean; urgent: boolean }) => {
      set({
        secondsLeft: data.secondsLeft,
        isTimerWarning: data.warning,
        isTimerUrgent: data.urgent,
      });

      if (data.urgent) {
        sound.playTimerUrgent();
      } else if (data.warning) {
        sound.playTimerTick();
      }
    });

    socket.on('auction:bid', (data: { bid: Bid; amount: number; teamName: string; playerName: string; state: AuctionState }) => {
      set({
        state: data.state,
        secondsLeft: data.state.auction?.secondsLeft ?? 10,
        isTimerWarning: false,
        isTimerUrgent: false,
        lastBidFlash: true,
      });

      sound.playBidChime();

      setTimeout(() => {
        set({ lastBidFlash: false });
      }, 700);

      get().showToast(`${data.teamName} bids ₹${(data.amount / 10000000).toFixed(2)} Cr!`, 'info');
    });

    socket.on('auction:sold', (data: any) => {
      set({
        state: data.state,
        soldOverlay: {
          player: data.player,
          winningTeam: data.winningTeam,
          finalPrice: data.finalPrice,
          formattedPrice: data.formattedPrice,
        },
      });

      sound.playGavelSound();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
        });
      } catch (e) {}

      get().showToast(`SOLD! ${data.player.name} to ${data.winningTeam.name}`, 'success');

      setTimeout(() => {
        set({ soldOverlay: null });
      }, 4200);
    });

    socket.on('auction:unsold', (data: any) => {
      set({
        state: data.state,
        unsoldOverlay: {
          player: data.player,
          basePrice: data.basePrice,
          formattedBasePrice: data.formattedBasePrice,
        },
      });

      sound.playUnsoldBuzzer();
      get().showToast(`UNSOLD: ${data.player.name}`, 'info');

      setTimeout(() => {
        set({ unsoldOverlay: null });
      }, 3500);
    });

    socket.on('auction:reset', (data: AuctionState) => {
      set({
        state: data,
        secondsLeft: 10,
        soldOverlay: null,
        unsoldOverlay: null,
      });
      get().showToast('Auction has been reset to starting state', 'info');
    });

    socket.on('auction:ended', (data: { message: string; state: AuctionState }) => {
      set({ state: data.state });
      get().showToast(data.message, 'info');
    });
  },

  placeBid: async (amount?: number, teamId?: string) => {
    const { isStandaloneMode, state } = get();

    if (!isStandaloneMode) {
      set({ isBidding: true });
      try {
        await api.placeBid(amount, teamId);
      } catch (err: any) {
        get().showToast(err.message, 'error');
        throw err;
      } finally {
        set({ isBidding: false });
      }
      return;
    }

    // Standalone Simulation Bid Handler
    if (!state || !state.activePlayer) return;
    set({ isBidding: true });

    try {
      const activeP = state.activePlayer;
      const effectiveTeam = state.teams.find((t) => t.id === teamId) || state.teams[0];
      const targetAmount = amount || (state.currentBid + getMinBidIncrement(state.currentBid));

      if (effectiveTeam.remainingPurse < targetAmount) {
        throw new Error('Insufficient purse for this bid.');
      }

      const newBid: Bid = {
        id: `bid-${Date.now()}`,
        auctionId: state.auction.id,
        playerId: activeP.id,
        player: activeP,
        teamId: effectiveTeam.id,
        team: effectiveTeam,
        amount: targetAmount,
        bidNumber: state.recentBids.length + 1,
        createdAt: new Date().toISOString(),
      };

      const nextState: AuctionState = {
        ...state,
        currentBid: targetAmount,
        highestBidTeam: effectiveTeam,
        auction: {
          ...state.auction,
          activePlayerPrice: targetAmount,
          highestBidTeamId: effectiveTeam.id,
        },
        recentBids: [newBid, ...state.recentBids],
        minIncrement: getMinBidIncrement(targetAmount),
      };

      set({
        state: nextState,
        secondsLeft: 10,
        isTimerWarning: false,
        isTimerUrgent: false,
        lastBidFlash: true,
      });

      sound.playBidChime();
      get().showToast(`${effectiveTeam.name} bids ₹${(targetAmount / 10000000).toFixed(2)} Cr!`, 'info');

      setTimeout(() => set({ lastBidFlash: false }), 600);
      get().startStandaloneTimer();

      // Trigger automatic AI rival franchise bid after 3 seconds if under budget
      setTimeout(() => {
        const cur = get().state;
        if (!cur || cur.auction.status !== 'ACTIVE' || !cur.highestBidTeam) return;
        if (cur.highestBidTeam.id === effectiveTeam.id && targetAmount < 140000000) {
          // Rival team (pick another team)
          const rivalTeam = cur.teams.find((t) => t.id !== effectiveTeam.id && t.remainingPurse > targetAmount + 2000000);
          if (rivalTeam) {
            const rivalBidAmount = targetAmount + getMinBidIncrement(targetAmount);
            const rivalBid: Bid = {
              id: `bid-${Date.now()}`,
              auctionId: cur.auction.id,
              playerId: activeP.id,
              player: activeP,
              teamId: rivalTeam.id,
              team: rivalTeam,
              amount: rivalBidAmount,
              bidNumber: cur.recentBids.length + 1,
              createdAt: new Date().toISOString(),
            };

            set({
              state: {
                ...cur,
                currentBid: rivalBidAmount,
                highestBidTeam: rivalTeam,
                auction: {
                  ...cur.auction,
                  activePlayerPrice: rivalBidAmount,
                  highestBidTeamId: rivalTeam.id,
                },
                recentBids: [rivalBid, ...cur.recentBids],
                minIncrement: getMinBidIncrement(rivalBidAmount),
              },
              secondsLeft: 10,
              lastBidFlash: true,
            });

            sound.playBidChime();
            get().showToast(`Counter-bid! ${rivalTeam.name} bids ₹${(rivalBidAmount / 10000000).toFixed(2)} Cr!`, 'info');
            setTimeout(() => set({ lastBidFlash: false }), 600);
            get().startStandaloneTimer();
          }
        }
      }, 3200);
    } catch (err: any) {
      get().showToast(err.message, 'error');
      throw err;
    } finally {
      set({ isBidding: false });
    }
  },

  adminActionStandalone: async (action: string, payload?: any) => {
    const { state } = get();
    if (!state) return;

    if (action === 'pause') {
      get().stopStandaloneTimer();
      set({ state: { ...state, auction: { ...state.auction, status: 'PAUSED' } } });
      get().showToast('Auction paused', 'info');
    } else if (action === 'resume' || action === 'start') {
      set({ state: { ...state, auction: { ...state.auction, status: 'ACTIVE' } } });
      get().startStandaloneTimer();
      get().showToast('Auction started/resumed', 'success');
    } else if (action === 'sell') {
      get().stopStandaloneTimer();
      if (!state.activePlayer || !state.highestBidTeam) {
        get().adminActionStandalone('unsold');
        return;
      }
      const winningTeam = state.highestBidTeam;
      const player = state.activePlayer;
      const finalPrice = state.currentBid;

      // Deduct purse and add player to squad
      const updatedTeams = state.teams.map((t) => {
        if (t.id === winningTeam.id) {
          const newPurse = t.remainingPurse - finalPrice;
          return {
            ...t,
            remainingPurse: newPurse,
            squadSize: (t.squadSize || 0) + 1,
            overseasCount: player.isOverseas ? (t.overseasCount || 0) + 1 : t.overseasCount,
            squad: [
              ...(t.squad || []),
              { id: `sp-${Date.now()}`, price: finalPrice, player: { ...player, status: 'SOLD' as any } },
            ],
          };
        }
        return t;
      });

      set({
        state: { ...state, teams: updatedTeams },
        soldOverlay: {
          player,
          winningTeam,
          finalPrice,
          formattedPrice: `₹${(finalPrice / 10000000).toFixed(2)} Cr`,
        },
      });

      sound.playGavelSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
        });
      } catch (e) {}

      setTimeout(() => {
        get().adminActionStandalone('next');
      }, 4000);
    } else if (action === 'unsold') {
      get().stopStandaloneTimer();
      if (!state.activePlayer) return;
      const player = state.activePlayer;

      set({
        unsoldOverlay: {
          player,
          basePrice: player.basePrice,
          formattedBasePrice: `₹${(player.basePrice / 10000000).toFixed(2)} Cr`,
        },
      });

      sound.playUnsoldBuzzer();

      setTimeout(() => {
        get().adminActionStandalone('next');
      }, 3500);
    } else if (action === 'next') {
      get().stopStandaloneTimer();
      set({ soldOverlay: null, unsoldOverlay: null });

      // Find next player
      const currentIndex = INITIAL_PLAYERS.findIndex((p) => p.id === state.activePlayer?.id);
      const nextP = INITIAL_PLAYERS[currentIndex + 1] || INITIAL_PLAYERS[0];

      set({
        state: {
          ...state,
          activePlayer: nextP,
          currentBid: nextP.basePrice,
          highestBidTeam: null,
          recentBids: [],
          minIncrement: getMinBidIncrement(nextP.basePrice),
          auction: {
            ...state.auction,
            activePlayerId: nextP.id,
            activePlayerPrice: nextP.basePrice,
            highestBidTeamId: null,
            status: 'ACTIVE',
          },
        },
        secondsLeft: 10,
        isTimerWarning: false,
        isTimerUrgent: false,
      });

      get().showToast(`Up Next: ${nextP.name}`, 'info');
      get().startStandaloneTimer();
    } else if (action === 'reset') {
      get().stopStandaloneTimer();
      const firstP = INITIAL_PLAYERS[0];
      set({
        state: {
          ...state,
          teams: INITIAL_TEAMS,
          activePlayer: firstP,
          currentBid: firstP.basePrice,
          highestBidTeam: null,
          recentBids: [],
          minIncrement: getMinBidIncrement(firstP.basePrice),
          auction: {
            ...state.auction,
            activePlayerId: firstP.id,
            activePlayerPrice: firstP.basePrice,
            highestBidTeamId: null,
            status: 'ACTIVE',
          },
        },
        secondsLeft: 10,
        soldOverlay: null,
        unsoldOverlay: null,
      });
      get().showToast('Auction reset to pristine state', 'info');
      get().startStandaloneTimer();
    }
  },
}));
