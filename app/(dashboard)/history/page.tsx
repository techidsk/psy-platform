import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table';
import { TableConfig } from '@/types/table';
import Image from 'next/image';

import { db } from '@/lib/db';
import { dateFormat, formatTime } from '@/lib/date';
import TableActions from '@/components/table-action';
import CheckExperimentHistoryButton from '@/components/check-experiment-histroy-button';

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

async function getHistory() {
    const experiments = await db.$queryRaw<ExperimentProps[]>`
        select e.*, u.username, u.avatar, n.engine_name, n.engine_image, eper.experiment_name
        from user_experiments e
        left join user u on u.id = e.user_id
        left join engine n on n.id = e.engine_id
        left join experiment eper on eper.nano_id = e.experiment_id
        order by e.id desc
        limit 15
    `;

    let formatResult = experiments.map((experiment) => {
        return {
            ...experiment,
            id: experiment.id.toString(),
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
export default async function ExperimentHistory() {
    const datas = await getHistory();

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="实验记录" text="查看用户实验记录"></DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table configs={experimentTableConfig} datas={datas} />
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
                    <div className="avatar">
                        <div className="rounded-full">
                            <Image
                                src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                                alt=""
                                width={48}
                                height={48}
                            />
                        </div>
                    </div>
                    <div className="text-gray-700">{data.username}</div>
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
