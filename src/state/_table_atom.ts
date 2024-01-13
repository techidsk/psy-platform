import { create } from 'zustand';
import store from 'store2';
import { get } from 'http';

interface CheckedIds {
    [itemName: string]: number[];
}

interface TableState {
    selectedIds: CheckedIds;
    setSelectIds: (ids: number[], itemName: string) => void;
    addSelectId: (id: number, itemName: string) => void;
    removeSelectId: (id: number, itemName: string) => void;
    resetIds: (itemName: string) => void;
}

export const useTableState = create<TableState>((set) => ({
    // 显示数量
    selectedIds: {},
    setSelectIds: (ids: number[], itemName: string) => {
        set((state) => {
            return {
                selectedIds: {
                    ...state.selectedIds,
                    [itemName]: ids,
                },
            };
        });
    },
    addSelectId: (id: number, itemName: string) => {
        set((state) => {
            const oldVal = state.selectedIds[itemName] || [];
            return {
                selectedIds: {
                    ...state.selectedIds,
                    [itemName]: [...oldVal, id],
                },
            };
        });
    },
    removeSelectId: (id: number, itemName: string) => {
        set((state) => {
            const oldVal = state.selectedIds[itemName] || [];
            return {
                selectedIds: {
                    ...state.selectedIds,
                    [itemName]: oldVal.filter((item) => item !== id),
                },
            };
        });
    },
    resetIds: (itemName: string) => {
        set((state) => {
            return {
                selectedIds: {
                    ...state.selectedIds,
                    [itemName]: [],
                },
            };
        });
    },
}));
