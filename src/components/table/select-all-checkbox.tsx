'use client';

import { useTableState } from '@/state/_table_atom';
export default function SelectAllCheckbox({
    datas,
    item_key,
}: {
    datas?: any[];
    item_key?: string;
}) {
    const addId = useTableState((state) => state.addSelectId);
    const removeId = useTableState((state) => state.removeSelectId);

    function selectAll(item_key: string) {
        if (!datas) return;
        const ids = datas.map((item: any) => item.id);
        ids.forEach((id: any) => {
            addId(id, item_key);
        });
    }

    function deSelectAll(item_key: string) {
        if (!datas) return;
        const ids = datas.map((item: any) => item.id);
        ids.forEach((id: any) => {
            removeId(id, item_key);
        });
    }

    return (
        <input
            type="checkbox"
            className="checkbox"
            onChange={(e) => {
                if (!item_key) return;
                if (e.target.checked) {
                    selectAll(item_key);
                } else {
                    deSelectAll(item_key);
                }
            }}
        />
    );
}
