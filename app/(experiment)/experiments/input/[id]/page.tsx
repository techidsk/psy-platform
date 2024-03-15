import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { db } from '@/lib/db';
import { ImageResponse } from '@/types/experiment';
import { ImageListServer } from '@/components/experiment/image-list-server';
import { dateFormat } from '@/lib/date';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCurrentUser } from '@/lib/session';

async function getExperiment(userId: number, experimentId: string) {
    const experiment = await db.user_experiments.findFirst({
        where: { user_id: userId, nano_id: experimentId },
    });

    return experiment;
}

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

async function getAccessKey() {
    const setting = await db.platform_setting.findFirst({});

    if (!setting) {
        console.log('未找到平台配置');
        return null;
    }

    return setting;
}

/**正式实验输入测试 */
export default async function MainInput({ params: { id } }: { params: { id: string } }) {
    // 获取用户实验prompt信息
    const user = await getCurrentUser();
    if (!user) {
        return;
    }
    const experiment = await getExperiment(parseInt(user?.id), id);
    const list = await getExperimentInfos(id);
    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;
    const startTime = experiment?.start_time
        ? Math.floor(new Date(experiment?.start_time).getTime() / 1000)
        : new Date().getTime() / 1000;

    return (
        <div className="bg-white mb-8">
            <div className="container mx-auto flex flex-col gap-4">
                <DashboardHeader heading="实验说明" text="请在下方的文本框内输入您的想法和感受。">
                    <div className="flex gap-2">
                        {/* <ExperimentSetting /> */}
                        <ExperimentFinishButton nanoId={id} experimentList={list} />
                    </div>
                </DashboardHeader>
                <div className="flex justify-center">
                    <CountDown start={startTime} limit={330} nanoId={id} />
                </div>
                <ImageListServer>
                    <ImageList experimentList={list} displayNum={displayNum} />
                </ImageListServer>
                <div className="flex flex-col gap-4 w-full">
                    <ExperimentEditor
                        nanoId={id}
                        trail={false}
                        experimentList={list}
                        displayNum={displayNum}
                    />
                </div>
            </div>
        </div>
    );
}
