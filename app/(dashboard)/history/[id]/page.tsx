import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { db } from "@/lib/db"
import { ImageResponse } from '@/types/experiment';
import { ImageListServer } from '@/components/experiment/image-list-server';
import { dateFormat } from '@/lib/date';
import { ExperimentSetting } from '@/components/experiment/experiment-setting';
import { ShowImageList } from '@/components/experiment/show-image-list';

async function getExperimentInfos(experimentId: string) {
    const result = await db.psy_trail.findMany({
        where: {
            user_experiment_id: experimentId
        }
    })
    let formatResult: ImageResponse[] = result.map((e, idx) => {
        return {
            id: e.id.toString(),
            prompt: e.prompt || undefined,
            state: e.state || undefined,
            create_time: e.create_time ? dateFormat(e.create_time) : undefined,
            update_time: e.update_time ? dateFormat(e.update_time) : undefined,
            timestamp: e.create_time ? new Date(e.create_time).getTime() : undefined,
            image_url: e.image_url || "",
            idx: idx
        }
    })
    let baseTimestamp = formatResult[0].timestamp || 0
    return formatResult.map(e => {
        return {
            ...e,
            timestamp: Math.floor(((e.timestamp || 0) - baseTimestamp) / 1000)
        }
    })
}

/**预实验输入测试 */
export default async function ExperimentHistory({ params: { id } }: any) {

    const list = await getExperimentInfos(id)

    return (
        <div className='h-screen bg-white'>
            <div className='container mx-auto flex flex-col gap-8'>
                <DashboardHeader heading='实验复现' text='点击开始，复现用户实验过程'>
                    <ExperimentSetting />
                </DashboardHeader>
                <ImageListServer>
                    <ShowImageList experimentList={list} />
                </ImageListServer>
                <div className='flex flex-col gap-4 w-full'>
                    <Link href='/history' className='w-full btn btn-outline btn-ghost '>
                        <button>返回</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
