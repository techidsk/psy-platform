import { create } from 'zustand';

interface ExperimentState {
    previewUrls: Record<string, string>;
    setPreviewUrl: (id: string, url: string | null) => void;
    currentImages: string[];
    setCurrentImages: (images: string[]) => void;
    resetCurrentImages: () => void;
    isFinishing: boolean;
    /** 原子 check-and-set，返回 true 表示当前调用方"抢到锁" */
    setIsFinishing: () => boolean;
}

export const useExperimentState = create<ExperimentState>((set, get) => ({
    previewUrls: {},
    setPreviewUrl: (id, url) =>
        set((state) => {
            const previewUrls = { ...state.previewUrls };
            if (url) previewUrls[id] = url;
            else delete previewUrls[id];
            return { previewUrls };
        }),
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
