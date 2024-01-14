import React from 'react';
import { TableHeader } from './table-header';
import { TableRow } from './table-row';
import { TableConfig } from '@/types/table';

interface TableProp {
    datas: any[];
    configs: TableConfig[];
    children?: React.ReactNode;
    searchNode?: React.ReactNode;
}
export function Table({ datas, configs, children, searchNode }: TableProp) {
    return (
        <>
            {searchNode && <div className="table-header p-2">{searchNode}</div>}
            <table className="table w-full">
                <TableHeader configs={configs} />
                <tbody>
                    {datas.map((data) => {
                        return <TableRow key={data.id} data={data} configs={configs} />;
                    })}
                </tbody>
            </table>
            <div className="px-4 py-2 flex justify-end">{children}</div>
        </>
    );
}
