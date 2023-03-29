import { create } from 'zustand'

export const useExperimentState = create((set, get) => ({
    text: '',
    setText: (newText) => set({ text: newText }),
    removeText: () => set(),

    style: 1,
    selectStyle: (newVal) => set({ style: newVal }),

    texts: [],
    addTexts: (newText) => set(state => ({ texts: [...state.texts, newText] })),

}))