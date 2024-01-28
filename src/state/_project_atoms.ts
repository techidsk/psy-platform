import { create } from 'zustand';
import store from 'store2';

interface ProjectState {
    projectId: number | undefined;
    setProjectId: (by: number | undefined) => void;
}

export const useProjectState = create<ProjectState>((set) => ({
    // 显示数量
    projectId: undefined,
    setProjectId: (newVal: number | undefined) => {
        if (newVal) {
            set((state) => ({ projectId: newVal }));
        }
    },
}));
