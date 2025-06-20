import { toast } from "@/hooks/use-toast";

class WebSocketService {
  socket: WebSocket | null = null;
  clientType: 'admin' | 'customer' = 'customer';
  userId: string | null = null;
  isConnected: boolean = false;
  reconnectAttempts: number = 0;
  maxReconnectAttempts: number = 5;
  reconnectTimeout: number = 5000; // 5 seconds
  notificationSound: HTMLAudioElement | null = null;

  constructor() {
    this.notificationSound = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;
  }

  connect(clientType: 'admin' | 'customer', userId: string | null = null) {
    if (typeof window === 'undefined') return;
    
    this.clientType = clientType;
    this.userId = userId;
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:5000';
    const wsUrl = `${wsProtocol}//${wsHost}`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }  onOpen() {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Register client type with the server
    this.sendMessage({
      type: 'register',
      clientType: this.clientType,
      userId: this.userId
    });
    
    // Dispatch custom event that WebSocket is connected
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('wsConnected', { detail: { connected: true } });
      window.dispatchEvent(customEvent);
    }
  }

  onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      console.log('WebSocket message received:', data);
      
      if (data.type === 'order') {
        this.handleOrderEvent(data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }  handleOrderEvent(data: any) {
    // Play notification sound
    if (this.notificationSound) {
      try {
        if (data.sound) {
          this.notificationSound.src = `data:audio/mp3;base64,${data.sound}`;
        }
        this.notificationSound.play().catch(err => console.error('Error playing notification sound:', err));
      } catch (err) {
        console.error('Error playing notification sound:', err);
      }
    }
    
    // Dispatch custom event for components to listen to
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('orderUpdate', { detail: data });
      window.dispatchEvent(customEvent);
      console.log('Dispatched orderUpdate event:', data);
    }
  }

  onClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event);
    this.isConnected = false;
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(this.clientType, this.userId);
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnect attempts reached. WebSocket connection closed.');
    }  }

  onError(error: Event) {
    console.error('WebSocket error:', error);
    
    // If we have a window object, dispatch an error event
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('wsError', { 
        detail: { 
          error: 'Connection error',
          timestamp: new Date().toISOString()
        } 
      });
      window.dispatchEvent(customEvent);
    }
    
    // Try to reconnect if possible
    this.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect after error (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(this.clientType, this.userId);
      }, this.reconnectTimeout);
    }
  }
  sendMessage(message: any) {
    if (this.socket) {
      // Check if socket is in OPEN state (WebSocket.OPEN = 1)
      if (this.socket.readyState === 1) {
        this.socket.send(JSON.stringify(message));
      } else if (this.socket.readyState === 0) {
        // If still connecting, queue the message to be sent once connected
        console.log('Socket still connecting, queueing message for later');
        setTimeout(() => {
          this.sendMessage(message);
        }, 1000); // Try again after 1 second
      } else {
        console.error(`Cannot send message: WebSocket readyState is ${this.socket.readyState}`);
      }
    } else {
      console.error('Cannot send message: WebSocket is not initialized');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Create a singleton instance
const webSocketService = typeof window !== 'undefined' ? new WebSocketService() : null;

export default webSocketService;
