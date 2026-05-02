import { create } from 'zustand';

const useChatbotStore = create((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),
}));

export default useChatbotStore;
