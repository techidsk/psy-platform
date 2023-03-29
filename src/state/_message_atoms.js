import { create } from 'zustand'

export const useMessageState = create((set, get) => ({
    toasts: [],
    setToasts: (title, message) => set({ text: newText }),
    removeText: () => set({ toasts: [] }),

}))