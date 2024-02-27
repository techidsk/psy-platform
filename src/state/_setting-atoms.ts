import { create } from 'zustand';
import store from 'store2';
interface SettingState {
    displayNum: number;
    setDisplayNum: (by: number) => void;
}

export const useSettingState = create<SettingState>((set) => ({
    // 显示数量
    displayNum: store('display_num') || 2,
    setDisplayNum: (newVal: number) => set((state) => ({ displayNum: newVal })),
}));
