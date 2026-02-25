import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected, reusing connection');
      return this.socket;
    }

    console.log('Creating new socket connection...');
    this.socket = io('http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
      // Authenticate with token
      this.socket.emit('authenticate', token);
    });

    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed:', data.message);
        // Try to reconnect with fresh token
        setTimeout(() => {
          const freshToken = localStorage.getItem('token');
          if (freshToken && this.socket?.connected) {
            this.socket.emit('authenticate', freshToken);
          }
        }, 2000);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
      
      // Auto-reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Send message
  sendMessage(receiverId, message) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', { receiverId, message });
    }
  }

  // Listen for incoming messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  // Mark messages as read
  markAsRead(senderId) {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { senderId });
    }
  }

  // Typing indicators
  startTyping(receiverId) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { receiverId });
    }
  }

  stopTyping(receiverId) {
    if (this.socket?.connected) {
      this.socket.emit('stop-typing', { receiverId });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  // Online/Offline status
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user-online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user-offline', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
