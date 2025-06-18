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
  }

  onOpen() {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Register client type with the server
    this.sendMessage({
      type: 'register',
      clientType: this.clientType,
      userId: this.userId
    });
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
  }
  handleOrderEvent(data: any) {
    // Play notification sound
    if (this.notificationSound) {
      if (data.sound) {
        this.notificationSound.src = `data:audio/mp3;base64,${data.sound}`;
      }
      this.notificationSound.play().catch(err => console.error('Error playing notification sound:', err));
    }
    
    // Handle different order events
    switch (data.event) {
      case 'created':
        if (this.clientType === 'admin') {
          toast({
            title: 'New Order Received',
            description: `Order #${data.order._id.substr(-6)} has been placed`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Order Placed',
            description: 'Your order has been received by the restaurant',
            variant: 'default',
          });
        }
        break;
        
      case 'statusUpdated':
        const statusMessages: Record<string, string> = {
          pending: 'Your order has been received',
          preparing: 'Your order is being prepared',
          ready: 'Your order is ready for pickup/delivery',
          delivered: 'Your order has been delivered',
          cancelled: 'Your order has been cancelled'
        };
        
        if (this.clientType === 'customer') {
          toast({
            title: 'Order Status Updated',
            description: statusMessages[data.order.status as string] || `Status: ${data.order.status}`,
            variant: 'default',
          });
        }
        break;
        
      case 'paymentUpdated':
        if (this.clientType === 'customer') {
          toast({
            title: 'Payment Status Updated',
            description: data.order.paid ? 'Your payment has been confirmed' : 'Payment status updated',
            variant: 'default',
          });
        }
        break;
    }
    
    // Dispatch custom event for components to listen to
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('orderUpdate', { detail: data });
      window.dispatchEvent(customEvent);
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
    }
  }

  onError(error: Event) {
    console.error('WebSocket error:', error);
  }

  sendMessage(message: any) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket is not connected');
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
