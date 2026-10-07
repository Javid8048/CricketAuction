import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  public socket: Socket | null = null;
  private isConnecting: boolean = false;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Cricket Auction Arena Real-time Server');
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('⚠️ Disconnected from Arena Server:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket Connection Error:', err.message);
      });
    }

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public emitBid(amount?: number) {
    const token = localStorage.getItem('caa_token');
    if (this.socket) {
      this.socket.emit('bid:place', { token, amount });
    }
  }
}

export const socketService = new SocketService();
