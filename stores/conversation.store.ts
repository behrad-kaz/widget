// stores/conversation.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Message, Conversation } from '@/lib/types/widget';

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useConversationStore = create<ConversationStore>()(
  devtools(
    persist(
      (set) => ({
        conversations: [],
        currentConversationId: null,
        messages: [],
        isLoading: false,

        setConversations: (conversations) => set({ conversations }),

        setCurrentConversation: (id) => set({ currentConversationId: id }),

        // ✅ اصلاح شده: جلوگیری از افزودن پیام تکراری
        addMessage: (message) =>
          set((state) => {
            // بررسی وجود پیام با همان ID
            const exists = state.messages.some((m) => m.id === message.id);
            if (exists) {
              return state; // اگر وجود دارد، تغییری نده
            }
            
            // بررسی وجود پیام با همان محتوا و زمان (برای مواردی که ID موقت با ID واقعی جایگزین می‌شود)
            const similarExists = state.messages.some((m) => 
              m.text === message.text && 
              Math.abs(m.timestamp.getTime() - message.timestamp.getTime()) < 2000
            );
            
            if (similarExists) {
              return state;
            }
            
            return {
              messages: [...state.messages, message],
            };
          }),

        setMessages: (messages) => set({ messages }),

        clearMessages: () => set({ messages: [] }),

        setIsLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: 'conversation-storage',
        partialize: (state) => ({
          currentConversationId: state.currentConversationId,
        }),
      }
    ),
    { name: 'ConversationStore' }
  )
);