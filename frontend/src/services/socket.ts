'use client';

import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection error:', err.message);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId: string): void {
  getSocket().emit('join_conversation', { conversation_id: conversationId });
}

export function leaveConversation(conversationId: string): void {
  getSocket().emit('leave_conversation', { conversation_id: conversationId });
}

export function sendMessage(conversationId: string, textContent: string): void {
  getSocket().emit('send_message', {
    conversation_id: conversationId,
    content_type: 'text',
    text_content: textContent,
  });
}

export function emitTyping(conversationId: string): void {
  getSocket().emit('typing', { conversation_id: conversationId });
}

export function onNewMessage(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('new_message', callback);
  return () => { s.off('new_message', callback); };
}

export function onMessageRead(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('message_read', callback);
  return () => { s.off('message_read', callback); };
}

export function onUserTyping(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('user_typing', callback);
  return () => { s.off('user_typing', callback); };
}

export function onConversationUpdated(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('conversation_updated', callback);
  return () => { s.off('conversation_updated', callback); };
}
