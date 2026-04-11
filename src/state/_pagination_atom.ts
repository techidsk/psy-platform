import { create, StateCreator } from 'zustand';

interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    loading: boolean;
    totalPages: () => number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setTotal: (total: number) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

export function createPaginationStore(defaultPageSize: number = 10) {
    return create<PaginationState>((set, get) => ({
        page: 1,
        pageSize: defaultPageSize,
        total: 0,
        loading: false,
        totalPages: () => {
            const { total, pageSize } = get();
            return Math.max(1, Math.ceil(total / pageSize));
        },
        setPage: (page: number) => set({ page }),
        setPageSize: (size: number) => set({ pageSize: size, page: 1 }),
        setTotal: (total: number) => set({ total }),
        setLoading: (loading: boolean) => set({ loading }),
        reset: () => set({ page: 1, pageSize: defaultPageSize, total: 0, loading: false }),
    }));
}
