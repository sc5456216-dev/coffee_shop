class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/orders/';
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(token);
      };
      this.socket.onerror = (error) => console.error('WebSocket error:', error);
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(token), 3000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  disconnect() {
    if (this.socket) this.socket.close();
    this.socket = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();