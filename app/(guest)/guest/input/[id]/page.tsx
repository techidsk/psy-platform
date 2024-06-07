import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import {
    getCountDownTime,
    getEncodedCallbackUrl,
    getExperiment,
    getExperimentInfos,
} from '@/lib/experiment';
import { getAccessKey } from '@/lib/platform';
import { logger } from '@/lib/logger';

export default async function GuestInput({
    params: { id: guestNanoId },
    searchParams,
}: {
    params: { id: string };
    searchParams: { [key: string]: string };
}) {
    // searchParams 部分
    // 实验 nanoId
    const userExperimentId = searchParams['e'];
    // 实验分步 index, 对应 experiment_step 的order
    const experimentStepIndex = searchParams['p'] as any as string;
    // callback url
    const callbackPath = searchParams['callback'];

    // callback 地址
    const encodedCallbackUrl = getEncodedCallbackUrl(
        callbackPath,
        experimentStepIndex,
        userExperimentId
    );

    const userExperiment = await getExperiment(guestNanoId, userExperimentId, experimentStepIndex);
    if (!userExperiment?.experiment_id) {
        logger.error('未找到用户实验中的关联的experimentId');
        return;
    }

    const experimentImageList = await getExperimentInfos(
        userExperimentId,
        parseInt(experimentStepIndex)
    );

    const platfomrSetting = await getAccessKey();
    const displayNum = platfomrSetting?.display_num || 1;

    const startTime = Math.floor(
        new Date(userExperiment?.start_time || new Date()).getTime() / 1000
    );

    // 获取实验倒计时
    const countDownTime = await getCountDownTime(
        parseInt(userExperiment.experiment_id),
        experimentStepIndex
    );

    logger.info(
        `实验id:${userExperiment.experiment_id}-${experimentStepIndex} 实验倒计时: ${countDownTime} 分钟，开始时间: ${startTime}`
    );

    return (
        <div className="bg-white container max-w-[1024px] mx-auto h-[100vh] py-4 flex flex-col gap-4 justify-between">
            <div className="flex justify-between items-center gap-4 flex-1">
                <ImageList experimentList={experimentImageList} displayNum={displayNum} />
            </div>
            <div className="flex-col-center gap-2">
                <ExperimentEditor
                    nanoId={userExperimentId}
                    experimentNanoId={searchParams['e']}
                    guestNanoId={guestNanoId}
                    part={parseInt(experimentStepIndex)}
                    guest={true}
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
                    />
                </div>
            </div>
        </div>
    );
}
