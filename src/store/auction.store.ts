import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { AuctionState, Player, Team, Bid } from '../types';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { sound } from '../utils/sound';

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
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  state: null,
  secondsLeft: 10,
  isTimerWarning: false,
  isTimerUrgent: false,
  isConnected: false,
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

  initState: async () => {
    try {
      const data = await api.getCurrentAuction();
      set({
        state: data,
        secondsLeft: data.auction?.secondsLeft ?? 10,
      });
    } catch (err: any) {
      console.error('Error fetching initial auction state:', err);
    }
  },

  initSocketListeners: () => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('auction:init', (data: AuctionState) => {
      set({
        state: data,
        secondsLeft: data.auction?.secondsLeft ?? 10,
        isConnected: true,
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

      // Launch Confetti
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
    set({ isBidding: true });
    try {
      await api.placeBid(amount, teamId);
    } catch (err: any) {
      get().showToast(err.message, 'error');
      throw err;
    } finally {
      set({ isBidding: false });
    }
  },
}));
