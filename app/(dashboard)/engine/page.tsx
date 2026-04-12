import { DashboardHeader } from '@/components/dashboard-header';
import { Icons } from '@/components/icons';
import { db } from '@/lib/db';
import { EngineDataTable } from './engine-table';

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
                    <EngineDataTable data={datas} />
                </div>
            </div>
        </div>
    );
}
