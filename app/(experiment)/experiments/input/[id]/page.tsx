import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { db } from '@/lib/db';
import { ImageResponse } from '@/types/experiment';
import { ImageListServer } from '@/components/experiment/image-list-server';
import { dateFormat } from '@/lib/date';
import { ExperimentSetting } from '@/components/experiment/experiment-setting';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';

async function getExperimentInfos(experimentId: string) {
    if (!experimentId) {
        return [];
    }

    // 获取用户实验prompt信息
    const result = await db.trail.findMany({
        where: { user_experiment_id: experimentId },
    });

    const formatResult: ImageResponse[] = result.map((e, idx) => {
        return {
            id: e.id.toString(),
            prompt: e.prompt || undefined,
            state: e.state || undefined,
            create_time: e.create_time ? dateFormat(e.create_time) : undefined,
            update_time: e.update_time ? dateFormat(e.update_time) : undefined,
            image_url: e.image_url || '',
            idx: idx,
        };
    });
    return formatResult;
}

/**正式实验输入测试 */
export default async function MainInput({ params: { id } }: { params: { id: string } }) {
    // 获取用户实验prompt信息
    const list = await getExperimentInfos(id);

    return (
        <div className="bg-white mb-8">
            <div className="container mx-auto flex flex-col gap-8">
                <DashboardHeader heading="实验说明" text="请在下方的文本框内输入您的想法和感受。">
                    <div className="flex gap-2">
                        <ExperimentSetting />
                        <ExperimentFinishButton nanoId={id} experimentList={list} />
                    </div>
                </DashboardHeader>
                <ImageListServer>
                    <ImageList experimentList={list} />
                </ImageListServer>
                <div className="flex flex-col gap-4 w-full">
                    <ExperimentEditor nanoId={id} trail={false} experimentList={list} />
                </div>
            </div>
        </div>
    );
}
