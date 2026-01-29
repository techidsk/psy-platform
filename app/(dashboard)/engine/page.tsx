import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { db } from '@/lib/db';
import { EngineTableEditButtons } from '@/components/engine/engine-table-edit-buttons';

async function getEngines() {
    const engines = await db.$queryRaw<any[]>`
        SELECT e.*
        FROM engine e
        WHERE state = true
        group by e.id
    `;

    const formatResult = engines.map((engine) => {
        return {
            ...engine,
            engine_description: engine.engine_description ?? '',
            state: Boolean(engine.state),
            num: Number(engine.num),
        };
    });
    return formatResult;
}

/** 生成服务引擎管理 */
export default async function EngineList() {
    const datas = await getEngines();

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="引擎管理" text="配置引擎相关设定">
                    <button className="btn btn-primary btn-sm">
                        <Icons.add />
                        新增
                    </button>
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table configs={experimentTableConfig} datas={datas} />
                </div>
            </div>
        </div>
    );
}

const experimentTableConfig: TableConfig[] = [
    {
        key: 'engine_image',
        label: '引擎',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <Image
                        className="rounded-sm"
                        src={data.engine_image}
                        alt={data.engine_name}
                        width={96}
                        height={96}
                    />
                    <span>{data.engine_name}</span>
                </div>
            );
        },
    },
    {
        key: 'state',
        label: '状态',
        children: (data: any) => {
            let text = Boolean(data.state) ? '可用' : '暂停';
            let type = Boolean(data.state) ? 'success' : 'error';
            return <State type={type}>{text}</State>;
        },
    },
    {
        key: 'prompt',
        label: '提示词',
        children: (data: any) => {
            return (
                <article className="whitespace-normal text-ellipsis line-clamp-4">
                    {data.gpt_prompt}
                </article>
            );
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return (
                <div className="flex gap-4 items-center">
                    <EngineTableEditButtons engineId={data.id} />
                </div>
            );
        },
    },
];
