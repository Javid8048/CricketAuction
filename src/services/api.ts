const API_BASE_URL = 'http://localhost:5000/api';

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
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<{ token: string; user: any }>(res);
  }

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ user: any }>(res);
  }

  // Players
  async getPlayers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/players${query ? `?${query}` : ''}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(res);
  }

  async getPlayerById(id: string) {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async createPlayer(data: any) {
    const res = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  async updatePlayer(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  async deletePlayer(id: string) {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  // Teams
  async getTeams() {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(res);
  }

  async getTeamById(id: string) {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async updateTeam(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(res);
  }

  // Auction
  async getCurrentAuction() {
    const res = await fetch(`${API_BASE_URL}/auction/current`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async placeBid(amount?: number, teamId?: string) {
    const res = await fetch(`${API_BASE_URL}/auction/bid`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, teamId }),
    });
    return this.handleResponse<any>(res);
  }

  async startAuction() {
    const res = await fetch(`${API_BASE_URL}/auction/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async pauseAuction() {
    const res = await fetch(`${API_BASE_URL}/auction/pause`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async resumeAuction() {
    const res = await fetch(`${API_BASE_URL}/auction/resume`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async selectPlayer(playerId: string) {
    const res = await fetch(`${API_BASE_URL}/auction/select`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ playerId }),
    });
    return this.handleResponse<any>(res);
  }

  async startBidding() {
    const res = await fetch(`${API_BASE_URL}/auction/start-bidding`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async nextPlayer() {
    const res = await fetch(`${API_BASE_URL}/auction/next`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async sellPlayer() {
    const res = await fetch(`${API_BASE_URL}/auction/sell`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async markUnsold() {
    const res = await fetch(`${API_BASE_URL}/auction/unsold`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async skipPlayer() {
    const res = await fetch(`${API_BASE_URL}/auction/skip`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async reauctionUnsold() {
    const res = await fetch(`${API_BASE_URL}/auction/reauction`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async resetAuction() {
    const res = await fetch(`${API_BASE_URL}/auction/reset`, {
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

    const res = await fetch(`${API_BASE_URL}/auction/history${query ? `?${query}` : ''}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async getAuctionResults() {
    const res = await fetch(`${API_BASE_URL}/auction/results`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }

  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/auction/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(res);
  }
}

export const api = new ApiService();
