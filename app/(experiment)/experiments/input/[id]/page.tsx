import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCurrentUser } from '@/lib/session';
import { getAccessKey } from '@/lib/platform';
import { getCountDownTime, getExperiment, getExperimentInfos } from '@/lib/experiment';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

export default async function MainInput({
    params: { id: userExperimentId },
    searchParams,
}: {
    params: { id: string };
    searchParams: { [key: string]: string };
}) {
    // 获取用户实验prompt信息
    const user = await getCurrentUser();
    if (!user) {
        logger.error('当前用户未登录');
        return;
    }

    // searchParams 部分
    const experimentStepIndex = searchParams['p'] as any as string;
    const callbackPath = searchParams['callback'];

    // callbackPath 部分
    const nextStepIndex = parseInt(experimentStepIndex) + 1;
    const callbackUrl = callbackPath + '?step_idx=' + nextStepIndex;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    logger.info(`callbackUrl: ${callbackUrl}`);

    const userExperiment = await getExperiment(user?.id, userExperimentId);

    const experimentImageList = await getExperimentInfos(
        userExperimentId,
        parseInt(experimentStepIndex)
    );

    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;

    const startTime = userExperiment?.start_time
        ? Math.floor(new Date(userExperiment?.start_time).getTime() / 1000)
        : new Date().getTime() / 1000;

    if (!userExperiment?.experiment_id) {
        logger.error('未找到用户实验中的关联的experimentId');
        return;
    }

    const countDownTime = await getCountDownTime(
        parseInt(userExperiment?.experiment_id),
        experimentStepIndex
    );

    logger.info(`实验倒计时: ${countDownTime} 分钟，开始时间: ${startTime}`);

    return (
        <div className="bg-white container max-w-[1024px] mx-auto h-[100vh] py-4 flex flex-col gap-4 justify-between">
            <div className="flex justify-between items-center gap-4 flex-1">
                <ImageList experimentList={experimentImageList} displayNum={displayNum} />
            </div>
            <div className="flex-col-center gap-2">
                <ExperimentEditor nanoId={userExperimentId} part={parseInt(experimentStepIndex)} />
                <div className="flex gap-8 items-center justify-end">
                    {countDownTime > 0 && (
                        <CountDown
                            start={startTime}
                            limit={countDownTime}
                            nanoId={userExperimentId}
                            callbackUrl={encodedCallbackUrl}
                            part={parseInt(experimentStepIndex)}
                        />
                    )}
                    <ExperimentFinishButton
                        nanoId={userExperimentId}
                        experimentList={experimentImageList}
                        callbackUrl={encodedCallbackUrl}
                        part={parseInt(experimentStepIndex)}
                    />
                </div>
            </div>
        </div>
    );
}
