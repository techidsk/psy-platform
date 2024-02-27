import { create } from 'zustand';

interface ExperimentState {
    currentImages: string[];
    setCurrentImages: (images: string[]) => void;
    resetCurrentImages: () => void;
}

export const useExperimentState = create<ExperimentState>((set) => ({
    currentImages: [],
    setCurrentImages: (images: string[]) => set((state) => ({ ...state, currentImages: images })),
    resetCurrentImages: () => set((state) => ({ ...state, currentImages: [] })),
}));
