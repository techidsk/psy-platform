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

    // 初始化时设置 checked 状态
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // 组件挂载和selectedIds变化时更新checked状态
        setChecked(selectedIds[itemName]?.includes(data.id) || false);
    }, [selectedIds, itemName, data.id]);

    function onCheck(e: any) {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        if (isChecked) {
            addId(data.id, itemName);
        } else {
            removeId(data.id, itemName);
        }
    }

    return (
        <div className="flex justify-center items-center">
            <input type="checkbox" checked={checked} className="checkbox" onChange={onCheck} />
        </div>
    );
}
