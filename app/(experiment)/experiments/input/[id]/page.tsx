import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ImageListServer } from '@/components/experiment/image-list-server';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCurrentUser } from '@/lib/session';
import { getAccessKey } from '@/lib/platform';
import { getCountDownTime, getExperiment, getExperimentInfos } from '@/lib/experiment';
import { logger } from '@/lib/logger';

export default async function MainInput({ params: { id } }: { params: { id: string } }) {
    // 获取用户实验prompt信息
    const user = await getCurrentUser();
    if (!user) {
        logger.error('当前用户未登录');
        return;
    }
    const userExperiment = await getExperiment(user?.id, id);

    const list = await getExperimentInfos(id);

    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;

    const startTime = userExperiment?.start_time
        ? Math.floor(new Date(userExperiment?.start_time).getTime() / 1000)
        : new Date().getTime() / 1000;

    if (!userExperiment?.experiment_id) {
        logger.error('未找到用户实验中的关联的experimentId');
        return;
    }

    const countDownTime = await getCountDownTime(parseInt(userExperiment?.experiment_id));

    return (
        <div className="bg-white mb-8">
            <div className="container mx-auto flex flex-col gap-4">
                <DashboardHeader heading="实验说明" text="请在下方的文本框内输入您的想法和感受。">
                    <div className="flex gap-4 items-center">
                        <CountDown start={startTime} limit={countDownTime} nanoId={id} />
                        <ExperimentFinishButton nanoId={id} experimentList={list} />
                    </div>
                </DashboardHeader>
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
