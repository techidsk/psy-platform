import { TableHeader } from "./table-header"
import { TableRow } from "./table-row"
import { TableConfig } from '@/types/table';

interface TableProp {
    datas: any[]
    configs: TableConfig[]
    children?: React.ReactNode
}
export function Table({
    datas,
    configs,
}: TableProp) {
    return (
        <table className="table w-full">
            <TableHeader configs={configs} />
            <tbody>
                {datas.map(data => {
                    return <TableRow key={data.id} data={data} configs={configs} />
                })}
            </tbody>
        </table>
    )
}