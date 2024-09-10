import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCurrentUser } from '@/lib/session';
import { getAccessKey } from '@/lib/platform';
import {
    getExperimentStepSetting,
    getEncodedCallbackUrl,
    getCurrentUserExperiment,
    getExperimentInfos,
} from '@/lib/experiment';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

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
        redirect('/login');
    }

    // searchParams 部分
    // 实验分步 index, 对应 experiment_step 的order
    const experimentStepIndex = searchParams['p'] as any as string;
    // callback url
    const callbackPath = searchParams['callback'];

    if (callbackPath === undefined) {
        toast({
            title: '非法页面',
            description: '未找到用户实验中的回调地址',
            variant: 'destructive',
            duration: 5000,
        });
        return;
    }

    // callbackPath 部分
    const encodedCallbackUrl = getEncodedCallbackUrl(
        callbackPath,
        experimentStepIndex,
        userExperimentId
    );

    const userExperiment = await getCurrentUserExperiment(
        user?.id,
        userExperimentId,
        experimentStepIndex
    );
    if (!userExperiment?.experiment_id) {
        logger.error('未找到用户实验中的关联的experimentId');
        toast({
            title: '未找到实验',
            description: '未找到用户实验中的关联实验',
            variant: 'destructive',
            duration: 5000,
        });
        return;
    }

    const { trails: experimentImageList, experiment_state: experimentState } =
        await getExperimentInfos(userExperimentId, parseInt(experimentStepIndex));
    // 实验是否结束
    const isExperimentFinished = experimentState == 'FINISHED';

    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;

    const startTime = Math.floor(
        new Date(userExperiment?.start_time || new Date()).getTime() / 1000
    );

    const {
        countdown: countDownTime,
        title: stepTitle,
        content: stepContent,
        picMode: isPicMode,
    } = await getExperimentStepSetting(parseInt(userExperiment.experiment_id), experimentStepIndex);

    logger.info(`实验倒计时: ${countDownTime} 分钟，开始时间: ${startTime}`);

    return (
        <div className="bg-white container max-w-[1024px] mx-auto h-[100vh] py-4 flex flex-col gap-4 justify-between">
            <div className="flex justify-between items-center gap-4 flex-1">
                <ImageList
                    experimentList={experimentImageList}
                    displayNum={displayNum}
                    isPicMode={isPicMode}
                />
            </div>
            <div className="flex-col-center gap-2">
                <ExperimentEditor
                    nanoId={userExperimentId}
                    part={parseInt(experimentStepIndex)}
                    isExperimentFinished={isExperimentFinished}
                />
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
                        stepTitle={stepTitle}
                        stepContent={stepContent}
                        isExperimentFinished={isExperimentFinished}
                    />
                </div>
            </div>
        </div>
    );
}
