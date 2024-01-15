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
                {datas.length > 0 && (
                    <tbody>
                        {datas.map((data) => {
                            return <TableRow key={data.id} data={data} configs={configs} />;
                        })}
                    </tbody>
                )}
            </table>
            {datas.length === 0 ? (
                <div className="w-full flex justify-center items-center h-[300px]">
                    <div>暂无数据</div>
                </div>
            ) : (
                <div className="px-4 py-2 flex justify-end">{children}</div>
            )}
        </>
    );
}
