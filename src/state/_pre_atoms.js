import { create } from 'zustand'

export const usePreExperimentState = create((set, get) => ({
    text: '',
    setText: (newText) => set({ text: newText }),
    removeText: () => set(),

    style: 1,
    selectStyle: (newVal) => set({ style: newVal }),
    
    engine: {},
    setEngine: (newVal) => set({ engine: newVal }),
}))