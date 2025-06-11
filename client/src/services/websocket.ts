import { EventEmitter } from 'events';
import { toast } from '../components/ui/use-toast';

type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message' | 'notification' | 'gameEvent' | 'villageUpdate' | 'playerUpdate';

class WebSocketService extends EventEmitter {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isConnected = false;
  private eventQueue: Array<{ type: string; data: any }> = [];

  private constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple components
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(token: string): void {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    // Close existing connection if any
    this.disconnect();

    try {
      // In development, use wss:// for secure WebSocket if your server supports it
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.REACT_APP_WS_URL || `${protocol}//${window.location.host}`;
      this.socket = new WebSocket(`${host}/ws?token=${token}`);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public send(event: string, data: any = {}): void {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify({ event, data }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      // Queue the message if not connected
      this.eventQueue.push({ type: event, data });
      console.warn('WebSocket not connected, queuing message:', event);
    }
  }

  public subscribe(event: WebSocketEvent, callback: (data: any) => void): () => void {
    this.on(event, callback);
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset reconnect delay
    
    // Process any queued messages
    this.processQueue();
    
    // Notify listeners
    this.emit('connect');
    
    // Send any authentication or subscription messages needed
    this.send('auth', { token: localStorage.getItem('token') });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const { event: eventType, data } = JSON.parse(event.data);
      
      // Emit the specific event type
      this.emit(eventType, data);
      
      // Also emit a generic message event
      this.emit('message', { event: eventType, data });
      
      // Handle specific event types
      switch (eventType) {
        case 'notification':
          this.handleNotification(data);
          break;
        case 'village:update':
          this.emit('villageUpdate', data);
          break;
        case 'player:update':
          this.emit('playerUpdate', data);
          break;
        case 'game:event':
          this.emit('gameEvent', data);
          break;
        default:
          console.log('Unhandled WebSocket event:', eventType, data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error, event.data);
    }
  }

  private handleNotification(notification: any): void {
    // Show a toast notification for important events
    if (notification.priority === 'high' || notification.priority === 'critical') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
    
    // Emit the notification event
    this.emit('notification', notification);
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.reason);
    this.isConnected = false;
    this.emit('disconnect', event);
    
    // Only attempt to reconnect if this wasn't a clean disconnect
    if (event.code !== 1000) { // 1000 is a normal closure
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
      }
    }, delay);
  }

  private processQueue(): void {
    while (this.eventQueue.length > 0 && this.isConnected) {
      const { type, data } = this.eventQueue.shift()!;
      this.send(type, data);
    }
  }
}

export const webSocketService = WebSocketService.getInstance();

// Helper hook for React components
export const useWebSocket = (event: WebSocketEvent, callback: (data: any) => void, deps: any[] = []) => {
  useEffect(() => {
    const unsubscribe = webSocketService.subscribe(event, callback);
    return () => unsubscribe();
  }, [event, ...deps]);
};
