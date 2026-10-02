// ============================================================
// FILE: hooks/useSocket.ts
// ============================================================
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/lib/types/widget';

interface UseSocketOptions {
  apiBaseUrl: string;
  conversationId: string;
  token: string;
  onMessage: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket({
  apiBaseUrl,
  conversationId,
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // ✅ استفاده از ref برای جلوگیری از اجرای مجدد
  const isConnectingRef = useRef(false);
  const conversationIdRef = useRef(conversationId);

  // ✅ به‌روزرسانی conversationIdRef
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const connect = useCallback(() => {
    // ✅ اگر در حال اتصال هستیم، دوباره وصل نشو
    if (isConnectingRef.current) {
      console.log('ℹ️ Already connecting, skipping...');
      return;
    }

    // ✅ اگر قبلاً متصل است، دوباره وصل نشو
    if (socketRef.current?.connected) {
      console.log('ℹ️ Socket already connected');
      return;
    }

    // ✅ اگر socket قبلاً ایجاد شده و در حال اتصال است، صبر کن
    if (socketRef.current) {
      console.log('ℹ️ Socket exists but not connected, attempting to reconnect...');
      socketRef.current.connect();
      return;
    }

    isConnectingRef.current = true;
    console.log('🔌 اتصال به Socket.io از Hook...', { apiBaseUrl, conversationId: conversationIdRef.current });

    const socket = io(apiBaseUrl, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      path: '/socket.io',
      autoConnect: false,
    });

    socketRef.current = socket;

    // ✅ اتصال دستی
    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Socket متصل شد (Hook)');
      setIsConnected(true);
      setIsConnecting(false);
      isConnectingRef.current = false;
      reconnectAttempts.current = 0;
      
      // ✅ پیوستن به گفتگو با conversationId فعلی
      const currentConvId = conversationIdRef.current;
      socket.emit('join_conversation', { conversationId: currentConvId });
      
      onConnect?.();
    });

    socket.on('conversation_joined', (data) => {
      console.log('📩 به گفتگو پیوستیم (Hook):', data.messages?.length || 0);
      if (data.messages) {
        data.messages.forEach((msg: any) => {
          onMessage({
            id: msg.id,
            text: msg.text,
            sender: msg.senderType === 'support' || msg.senderType === 'agent' ? 'support' : 'customer',
            timestamp: new Date(msg.timestamp),
            isInternal: msg.isInternal || false,
          });
        });
      }
    });

    socket.on('new_message', (message) => {
      console.log('💬 پیام جدید (Hook):', message);
      onMessage({
        id: message.id,
        text: message.text,
        sender: message.senderType === 'support' || message.senderType === 'agent' ? 'support' : 'customer',
        timestamp: new Date(message.timestamp),
        isInternal: message.isInternal || false,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket قطع شد (Hook): ${reason}`);
      setIsConnected(false);
      isConnectingRef.current = false;
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ خطا در اتصال Socket (Hook):', error);
      setIsConnecting(false);
      isConnectingRef.current = false;
      
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ حداکثر تعداد تلاش برای اتصال مجدد رسید');
        socket.disconnect();
      }
      
      onError?.(new Error(error.message));
    });

    socket.on('error', (error) => {
      console.error('❌ خطا در Socket (Hook):', error);
      onError?.(new Error(error.message));
    });
  }, [apiBaseUrl, token, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(true);
      isConnectingRef.current = false;
      reconnectAttempts.current = 0;
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ Socket not connected, message not sent');
      throw new Error('Socket not connected');
    }
    console.log('📤 ارسال پیام (Hook):', text);
    socketRef.current.emit('send_message', {
      conversationId: conversationIdRef.current,
      text,
      isInternal: false,
    });
  }, [isConnected]);

  // ✅ فقط یک بار در mount اجرا شود
  useEffect(() => {
    connect();
    return () => disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← خالی کردن dependency array

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
// ============================================================