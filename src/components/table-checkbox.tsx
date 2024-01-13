'use client';
import { useTableState } from '@/state/_table_atom';
import { useEffect, useState } from 'react';

interface TableCheckboxProps {
    data: any;
    itemName: string;
}

export default function TableCheckbox({ data, itemName }: TableCheckboxProps) {
    const selectedIds = useTableState((state) => state.selectedIds);
    const addId = useTableState((state) => state.addSelectId);
    const removeId = useTableState((state) => state.removeSelectId);
    function onCheck(e: any, data: any) {
        if (e.target.checked) {
            setChecked(true);
            addId(data.id, itemName);
        } else {
            setChecked(false);
            removeId(data.id, itemName);
        }
    }

    const itemIds = selectedIds[itemName] || [];
    // 初始化时设置 checked 状态
    const [checked, setChecked] = useState(selectedIds[itemName]?.includes(data.id));

    // 当 selectedIds 变化时更新 checked 状态
    useEffect(() => {
        setChecked(selectedIds[itemName]?.includes(data.id));
    }, [selectedIds, itemName, data.id]);

    return (
        <input
            type="checkbox"
            checked={checked}
            className="checkbox"
            onChange={() => {}}
            onClick={(e) => onCheck(e, data)}
        />
    );
}
