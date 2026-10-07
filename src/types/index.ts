export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEAM' | 'SPECTATOR';
  teamId?: string | null;
  team?: Team | null;
}

export interface Player {
  id: string;
  name: string;
  profileImage: string;
  country: string;
  isOverseas: boolean;
  age: number;
  role: 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';
  battingStyle: string;
  bowlingStyle: string;
  basePrice: number;
  category: string;
  matches: number;
  runs: number;
  battingAvg: number;
  strikeRate: number;
  highestScore: number;
  wickets: number;
  economy: number;
  bowlingAvg: number;
  bestBowling: string;
  status: 'UPCOMING' | 'IN_AUCTION' | 'SOLD' | 'UNSOLD';
  currentPrice?: number | null;
  teamPlayer?: {
    team: Team;
    price: number;
  } | null;
  bids?: Bid[];
  auctionPlayers?: AuctionPlayer[];
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
  totalPurse: number;
  remainingPurse: number;
  maxSquadSize: number;
  maxOverseas: number;
  squadSize?: number;
  overseasCount?: number;
  batters?: number;
  bowlers?: number;
  allRounders?: number;
  wicketkeepers?: number;
  totalSpent?: number;
  avgPlayerPrice?: number;
  highestPurchase?: number;
  squad?: Array<{
    id: string;
    price: number;
    player: Player;
  }>;
}

export interface Auction {
  id: string;
  name: string;
  status: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  currentRound: number;
  defaultTimerSec: number;
  activePlayerId?: string | null;
  activePlayerPrice?: number | null;
  highestBidTeamId?: string | null;
  secondsLeft?: number;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface AuctionPlayer {
  id: string;
  auctionId: string;
  playerId: string;
  player: Player;
  status: 'PENDING' | 'CURRENT' | 'SOLD' | 'UNSOLD' | 'SKIPPED';
  round: number;
  orderIndex: number;
  basePrice: number;
  finalPrice?: number | null;
  winningTeamId?: string | null;
  winningTeam?: Team | null;
  soldAt?: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  playerId: string;
  player?: Player;
  teamId: string;
  team: Team;
  amount: number;
  bidNumber: number;
  createdAt: string;
}

export interface AuctionState {
  auction: Auction;
  activePlayer: Player | null;
  highestBidTeam: Team | null;
  currentBid: number;
  teams: Team[];
  recentBids: Bid[];
  minIncrement: number;
}

export interface DashboardStats {
  summary: {
    totalPlayers: number;
    soldCount: number;
    unsoldCount: number;
    remainingCount: number;
    totalSpent: number;
    avgPrice: number;
    highestPurchase: AuctionPlayer | null;
  };
  spendingByTeam: Array<{
    name: string;
    shortName: string;
    color: string;
    totalSpent: number;
    remainingPurse: number;
    squadCount: number;
    overseasCount: number;
  }>;
  soldByRole: Array<{
    role: string;
    count: number;
  }>;
  soldByCountry: Array<{
    country: string;
    count: number;
  }>;
  priceDistribution: Array<{
    label: string;
    min: number;
    max: number;
    count: number;
  }>;
  recentPurchases: AuctionPlayer[];
}
