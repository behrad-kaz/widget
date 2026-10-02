// ============================================================
// FILE: stores/widget.store.ts
// ============================================================
import { create } from 'zustand';
import { type WidgetState } from '@/lib/types/widget';

interface WidgetStore {
  state: WidgetState;
  conversationId: string | null;
  setState: (state: WidgetState) => void;
  setConversationId: (id: string) => void;
  reset: () => void;
}

export const useWidgetStore = create<WidgetStore>((set) => ({
  state: 'closed',
  conversationId: null,
  setState: (state) => set({ state }),
  setConversationId: (conversationId) => set({ conversationId }),
  reset: () => set({ state: 'closed', conversationId: null }),
}));
// ============================================================