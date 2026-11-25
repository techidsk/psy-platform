import { getUrl } from '@/lib/url';
import { create } from 'zustand';

interface ExperimentState {
    previewUrls: Record<string, string>;
    setPreviewUrl: (id: string, url: string | null) => void;
    currentImages: string[];
    setCurrentImages: (images: string[]) => void;
    resetCurrentImages: () => void;
    finishStep: (id: string, part: number) => Promise<boolean>;
}

const pendingSteps = new Set<string>();

export const useExperimentState = create<ExperimentState>((set) => ({
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
    finishStep: async (id, part) => {
        const key = JSON.stringify([id, part]);
        if (pendingSteps.has(key)) return false;
        pendingSteps.add(key);
        try {
            const response = await fetch(getUrl('/api/experiment/finish'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, part }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.msg || '提交失败，请重试');
            }
            return true;
        } finally {
            pendingSteps.delete(key);
        }
    },
}));
