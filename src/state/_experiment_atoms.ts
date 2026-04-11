import { create } from 'zustand';

interface ExperimentState {
    currentImages: string[];
    setCurrentImages: (images: string[]) => void;
    resetCurrentImages: () => void;
    isFinishing: boolean;
    /** 原子 check-and-set，返回 true 表示当前调用方"抢到锁" */
    setIsFinishing: () => boolean;
}

export const useExperimentState = create<ExperimentState>((set, get) => ({
    currentImages: [],
    setCurrentImages: (images: string[]) => set((state) => ({ ...state, currentImages: images })),
    resetCurrentImages: () => set((state) => ({ ...state, currentImages: [] })),
    isFinishing: false,
    setIsFinishing: () => {
        if (get().isFinishing) return false;
        set({ isFinishing: true });
        return true;
    },
}));
