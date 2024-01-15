import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import Image from 'next/image';

import { db } from '@/lib/db';
import { dateFormat, formatTime } from '@/lib/date';
import TableActions from '@/components/table/table-action';
import CheckExperimentHistoryButton from '@/components/check-experiment-histroy-button';
import Pagination from '@/components/pagination';
import { getCurrentUser } from '@/lib/session';
import { TableSearch } from '@/components/table/table-search';

interface ExperimentProps {
    id: number;
    user_id: number;
    nano_id: string;
    experiment_id: number;
    type: string;
    engine_id: number;
    start_time: Date;
    finish_time: Date;
    username: string;
    avatar?: string;
    engine_name: string;
    engine_image: string;
    experiment_name?: string;
}

async function getHistory(
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const experiments = await db.$queryRaw<ExperimentProps[]>`
        select e.*, u.username, u.avatar, n.engine_name, n.engine_image, 
        eper.experiment_name, g.group_name
        from user_experiments e
        left join user u on u.id = e.user_id
        left join experiment eper on eper.nano_id = e.experiment_id
        left join project_group g on g.id = e.project_group_id
        left join engine n on n.id = e.engine_id
        WHERE e.user_id = ${currentUser.id}
        order by e.id desc
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    let formatResult = experiments.map((experiment) => {
        return {
            ...experiment,
            user_id: experiment?.user_id,
            start_time: experiment?.start_time ? dateFormat(experiment?.start_time) : '',
            finish_time: experiment?.finish_time ? dateFormat(experiment?.finish_time) : '',
            start_timestamp: experiment?.start_time
                ? new Date(experiment?.start_time).getTime()
                : 0,
            finish_timestamp: experiment?.finish_time
                ? new Date(experiment?.finish_time).getTime()
                : 0,
        };
    });
    return formatResult;
}

/**实验管理 */
export default async function ExperimentHistory({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getHistory(searchParams, currentPage, currentPageSize);

    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="实验记录" text="查看用户实验记录"></DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table
                        configs={experimentTableConfig}
                        datas={datas}
                        searchNode={
                            <TableSearch defaultParams={searchParams} searchDatas={searchDatas} />
                        }
                    >
                        <Pagination current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
                </div>
            </div>
        </div>
    );
}

const experimentTableConfig: TableConfig[] = [
    {
        key: 'engine_id',
        label: '使用引擎',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 justify-center">
                    <Image
                        className="rounded"
                        src={data.engine_image}
                        alt={data.engine_name}
                        width={48}
                        height={48}
                    />
                    <div className="text-gray-700">{data.engine_name}</div>
                </div>
            );
        },
    },
    {
        key: 'user_id',
        label: '实验对象',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 justify-center">
                    <Image
                        className="rounded-full"
                        src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                        alt=""
                        width={48}
                        height={48}
                    />
                    <div className="text-gray-700">{data.username}</div>
                </div>
            );
        },
    },
    {
        key: 'group_name',
        label: '所属分组',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.group_name}</span>
                </div>
            );
        },
    },
    {
        key: 'experiment_name',
        label: '所属实验',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.experiment_name}</span>
                </div>
            );
        },
    },
    {
        key: 'start_time',
        label: '创建时间',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.start_time.split(' ')[0]}</span>
                    <span>{data.start_time.split(' ')[1]}</span>
                </div>
            );
        },
    },
    {
        key: 'finish_time',
        label: '试验时间',
        children: (data: any) => {
            let d = Math.floor((data.finish_timestamp - data.start_timestamp) / 1000);
            return (
                <div className="flex flex-col gap-2">
                    {d > 0 ? <span>{formatTime(d)}</span> : '项目未完成'}
                </div>
            );
        },
    },
    {
        key: 'type',
        label: '状态',
        children: (data: any) => {
            let obj =
                data.type === 'TRAIL'
                    ? {
                          text: '预实验',
                          type: 'pending',
                      }
                    : {
                          text: '正式实验',
                          type: 'success',
                      };

            return <State type={obj.type}>{obj.text}</State>;
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return (
                <TableActions>
                    <CheckExperimentHistoryButton data={data} />
                </TableActions>
            );
        },
    },
];

const searchDatas = [
    { name: 'username', type: 'input', placeholder: '请输入用户名' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
];
