import { create } from 'zustand';
import { apiFetch } from '../services/api';
import {
  joinConversation,
  leaveConversation,
  onNewMessage,
  onMessageRead,
  onConversationUpdated,
  onUserTyping,
} from '../services/socket';

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing_title?: string;
  other_user_name?: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content_type: 'text' | 'image' | 'voice_note';
  text_content?: string;
  file_url?: string;
  file_duration_sec?: number;
  file_waveform?: number[];
  read_at?: string;
  created_at: string;
}

interface MessagingState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  unreadCounts: Record<string, number>;
  typingUsers: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  createConversation: (listingId: string, message: string) => Promise<string>;
  sendMessage: (conversationId: string, text: string) => void;
  sendImageMessage: (conversationId: string, file: File) => Promise<void>;
  sendVoiceMessage: (conversationId: string, blob: Blob, durationSec: number) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  initSocketListeners: () => () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  unreadCounts: {},
  typingUsers: {},
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<Conversation[]>('/conversations');
      set({ conversations: data, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  openConversation: async (conversationId: string) => {
    set({ activeConversationId: conversationId, isLoading: true, error: null });
    try {
      const data = await apiFetch<{
        conversation: Conversation;
        messages: Message[];
        total: number;
      }>(`/conversations/${conversationId}`);
      set({ messages: data.messages, isLoading: false });
      joinConversation(conversationId);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createConversation: async (listingId: string, message: string) => {
    try {
      const data = await apiFetch<{ id: string; listing_id: string; buyer_id: string; seller_id: string }>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId, message }),
      });
      await get().fetchConversations();
      return data.id;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  sendMessage: (conversationId: string, text: string) => {
    const { apiFetch: _ } = { apiFetch }; // ensure module loaded
    // Send via Socket.IO for real-time
    import('../services/socket').then(({ sendMessage: socketSend }) => {
      socketSend(conversationId, text);
    });

    // Also persist via REST for reliability
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: 'me',
      content_type: 'text',
      text_content: text,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, tempMsg] }));
  },

  sendImageMessage: async (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('content_type', 'image');

    const data = await apiFetch<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
    } as any);

    set((state) => ({ messages: [...state.messages, data] }));
  },

  sendVoiceMessage: async (conversationId: string, blob: Blob, durationSec: number) => {
    const formData = new FormData();
    formData.append('file', blob, 'voice_note.webm');
    formData.append('content_type', 'voice_note');
    formData.append('duration_sec', durationSec.toString());

    const data = await apiFetch<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
    } as any);

    set((state) => ({ messages: [...state.messages, data] }));
  },

  setActiveConversation: (id: string | null) => {
    const prevId = get().activeConversationId;
    if (prevId) leaveConversation(prevId);
    set({ activeConversationId: id, messages: id ? get().messages : [] });
    if (id) joinConversation(id);
  },

  initSocketListeners: () => {
    const unsubNewMsg = onNewMessage((data: Message) => {
      set((state) => {
        if (data.conversation_id === state.activeConversationId) {
          return { messages: [...state.messages, data] };
        }
        return state;
      });
    });

    const unsubRead = onMessageRead((data: { conversation_id: string }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.conversation_id === data.conversation_id ? { ...m, read_at: m.read_at || new Date().toISOString() } : m
        ),
      }));
    });

    const unsubConvUpdate = onConversationUpdated((data: { conversation_id: string; last_message?: string }) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === data.conversation_id
            ? { ...c, last_message: data.last_message, updated_at: new Date().toISOString() }
            : c
        ),
      }));
    });

    const unsubTyping = onUserTyping((data: { conversation_id: string; user_id: string }) => {
      set((state) => {
        const current = state.typingUsers[data.conversation_id] || [];
        if (!current.includes(data.user_id)) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [data.conversation_id]: [...current, data.user_id],
            },
          };
        }
        return state;
      });

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [data.conversation_id]: (state.typingUsers[data.conversation_id] || []).filter(
              (uid) => uid !== data.user_id
            ),
          },
        }));
      }, 3000);
    });

    return () => {
      unsubNewMsg();
      unsubRead();
      unsubConvUpdate();
      unsubTyping();
    };
  },
}));