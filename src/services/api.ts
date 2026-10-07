export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('caa_backend_url');
    if (saved) return saved.trim().replace(/\/+$/, '');
  }
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    return (env.VITE_API_URL as string).trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
}

export function getApiBaseUrl(): string {
  return `${getBackendUrl()}/api`;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('caa_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMsg = 'API request failed';
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (e) {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<{ token: string; user: any }>(res);
  }

  async getCurrentUser() {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ user: any }>(res);
  }

  // Players
  async getPlayers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${getApiBaseUrl()}/players${query ? `?${query}` : ''}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(res);
  }

  async getPlayerById(id: string) {
    const res = await fetch(`${getApiBaseUrl()}/players/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async createPlayer(data: any) {
    const res = await fetch(`${getApiBaseUrl()}/players`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  async updatePlayer(id: string, data: any) {
    const res = await fetch(`${getApiBaseUrl()}/players/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  async deletePlayer(id: string) {
    const res = await fetch(`${getApiBaseUrl()}/players/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  // Teams
  async getTeams() {
    const res = await fetch(`${getApiBaseUrl()}/teams`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(res);
  }

  async getTeamById(id: string) {
    const res = await fetch(`${getApiBaseUrl()}/teams/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async updateTeam(id: string, data: any) {
    const res = await fetch(`${getApiBaseUrl()}/teams/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  // Auction
  async getCurrentAuction() {
    const res = await fetch(`${getApiBaseUrl()}/auction/current`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async placeBid(amount?: number, teamId?: string) {
    const res = await fetch(`${getApiBaseUrl()}/auction/bid`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, teamId }),
    });
    return this.handleResponse<any>(res);
  }

  async startAuction() {
    const res = await fetch(`${getApiBaseUrl()}/auction/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async pauseAuction() {
    const res = await fetch(`${getApiBaseUrl()}/auction/pause`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async resumeAuction() {
    const res = await fetch(`${getApiBaseUrl()}/auction/resume`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async selectPlayer(playerId: string) {
    const res = await fetch(`${getApiBaseUrl()}/auction/select`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ playerId }),
    });
    return this.handleResponse<any>(res);
  }

  async startBidding() {
    const res = await fetch(`${getApiBaseUrl()}/auction/start-bidding`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async nextPlayer() {
    const res = await fetch(`${getApiBaseUrl()}/auction/next`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async sellPlayer() {
    const res = await fetch(`${getApiBaseUrl()}/auction/sell`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async markUnsold() {
    const res = await fetch(`${getApiBaseUrl()}/auction/unsold`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async skipPlayer() {
    const res = await fetch(`${getApiBaseUrl()}/auction/skip`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async reauctionUnsold() {
    const res = await fetch(`${getApiBaseUrl()}/auction/reauction`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async resetAuction() {
    const res = await fetch(`${getApiBaseUrl()}/auction/reset`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async getAuctionHistory(teamId?: string, playerId?: string) {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (playerId) params.append('playerId', playerId);
    const query = params.toString();

    const res = await fetch(`${getApiBaseUrl()}/auction/history${query ? `?${query}` : ''}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async getAuctionResults() {
    const res = await fetch(`${getApiBaseUrl()}/auction/results`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async getDashboardStats() {
    const res = await fetch(`${getApiBaseUrl()}/auction/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }
}

export const api = new ApiService();
