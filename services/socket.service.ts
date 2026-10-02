// ============================================================
// FILE: services/socket.service.ts
// ============================================================
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/lib/types/widget';

export interface SocketConfig {
  apiBaseUrl: string;
  token: string;
  conversationId: string;
}

export class SocketService {
  private socket: Socket | null = null;
  private config: SocketConfig | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  connect(config: SocketConfig) {
    this.config = config;

    console.log('🔌 اتصال به Socket.IO...', {
      apiBaseUrl: config.apiBaseUrl,
      conversationId: config.conversationId,
      hasToken: !!config.token,
    });

    // ✅ اتصال به Socket.io بک‌اند
    this.socket = io(config.apiBaseUrl, {
      auth: { token: config.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // ✅ مسیر پیش‌فرض Socket.io
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket متصل شد');
      this.socket?.emit('join_conversation', { conversationId: config.conversationId });
      this.connectionHandlers.forEach((handler) => handler(true));
    });

    this.socket.on('conversation_joined', (data) => {
      console.log('📩 به گفتگو پیوستیم، پیام‌های قبلی:', data.messages?.length || 0);
      if (data.messages) {
        data.messages.forEach((msg: any) => {
          this.messageHandlers.forEach((handler) =>
            handler({
              id: msg.id,
              text: msg.text,
              sender: msg.senderType === 'support' ? 'support' : 'customer',
              timestamp: new Date(msg.timestamp),
              isInternal: msg.isInternal || false,
            })
          );
        });
      }
    });

    this.socket.on('new_message', (message) => {
      console.log('💬 پیام جدید:', message);
      this.messageHandlers.forEach((handler) =>
        handler({
          id: message.id,
          text: message.text,
          sender: message.senderType === 'support' ? 'support' : 'customer',
          timestamp: new Date(message.timestamp),
          isInternal: message.isInternal || false,
        })
      );
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket قطع شد');
      this.connectionHandlers.forEach((handler) => handler(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ خطا در اتصال Socket:', error);
      this.connectionHandlers.forEach((handler) => handler(false));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket قطع شد (دستی)');
    }
  }

  sendMessage(text: string) {
    if (!this.socket || !this.config) {
      throw new Error('Socket not connected');
    }
    console.log('📤 ارسال پیام:', text);
    this.socket.emit('send_message', {
      conversationId: this.config.conversationId,
      text,
      isInternal: false,
    });
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

let socketServiceInstance: SocketService | null = null;

export const getSocketService = () => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService();
  }
  return socketServiceInstance;
};
// ============================================================