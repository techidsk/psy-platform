import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import {
    getExperimentStepSetting,
    getEncodedCallbackUrl,
    getCurrentUserExperiment,
    getExperimentInfos,
} from '@/lib/experiment';
import { getAccessKey } from '@/lib/platform';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

export default async function GuestInput({
    params,
    searchParams: searchParamsPromise,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { id: guestNanoId } = await params;
    const searchParams = await searchParamsPromise;

    // searchParams 部分
    // 实验 nanoId
    const userExperimentId = searchParams['e'];
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
    // callback 地址
    const encodedCallbackUrl = getEncodedCallbackUrl(
        callbackPath,
        experimentStepIndex,
        userExperimentId
    );

    const userExperiment = await getCurrentUserExperiment(
        guestNanoId,
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

    console.log(`Page Component: Received experimentState: ${experimentState}`);

    const isExperimentFinished = experimentState == 'FINISHED';

    console.log(`Page Component: Calculated isExperimentFinished: ${isExperimentFinished}`);

    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;

    const startTime = Math.floor(
        new Date(userExperiment?.start_time || new Date()).getTime() / 1000
    );

    // 获取实验倒计时
    const {
        countdown: countDownTime,
        title: stepTitle,
        content: stepContent,
        picMode: isPicMode,
    } = await getExperimentStepSetting(parseInt(userExperiment.experiment_id), experimentStepIndex);

    logger.info(
        `实验id:${userExperiment.experiment_id}-${experimentStepIndex} 
        实验倒计时: ${countDownTime} 分钟，开始时间: ${startTime}
        实验图片模式: ${isPicMode}`
    );

    return (
        <div className="bg-white container max-w-[1024px] mx-auto h-screen py-4 flex flex-col">
            <div className="flex flex-col h-full">
                <div className="flex min-h-[50%] overflow-auto">
                    <ImageList
                        experimentImageList={experimentImageList}
                        displayNum={displayNum}
                        isPicMode={isPicMode}
                    />
                </div>
                <div className="flex-1 min-h-[50%] flex-col-center">
                    <ExperimentEditor
                        nanoId={userExperimentId}
                        experimentNanoId={searchParams['e']}
                        guestNanoId={guestNanoId}
                        part={parseInt(experimentStepIndex)}
                        guest={true}
                        isExperimentFinished={isExperimentFinished}
                        experimentImageList={experimentImageList}
                        stepTitle={stepTitle}
                        stepContent={stepContent}
                    />
                    <div className="flex gap-8 items-center justify-end mt-4">
                        {!isExperimentFinished && countDownTime > 0 && (
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
                            experimentImageList={experimentImageList}
                            callbackUrl={encodedCallbackUrl}
                            part={parseInt(experimentStepIndex)}
                            stepTitle={stepTitle}
                            stepContent={stepContent}
                            isExperimentFinished={isExperimentFinished}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
