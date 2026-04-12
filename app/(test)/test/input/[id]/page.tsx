import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCurrentUser } from '@/lib/session';
import { getAccessKey } from '@/lib/platform';
import {
    getExperimentStepSetting,
    getEncodedCallbackUrl,
    getExperimentInfos,
} from '@/lib/experiment';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';

export default async function TestInput({
    params,
    searchParams: searchParamsPromise,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { id: userExperimentId } = await params;
    const searchParams = await searchParamsPromise;

    const user = await getCurrentUser();
    if (!user) {
        logger.error('[测试模式] 当前用户未登录');
        redirect('/');
    }

    if (user.role !== 'SUPERADMIN') {
        logger.error(`[测试模式] 用户 ${user.id} 无权限访问测试页面`);
        redirect('/dashboard');
    }

    const experimentStepIndex = searchParams['p'] as any as string;
    const callbackPath = searchParams['callback'];

    if (callbackPath === undefined) {
        logger.error('[测试模式] 未找到回调地址');
        redirect('/dashboard');
    }

    const encodedCallbackUrl = getEncodedCallbackUrl(
        callbackPath,
        experimentStepIndex,
        userExperimentId
    );

    // SUPERADMIN 直接通过 nano_id 查询，跳过用户归属校验
    const userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentId, part: parseInt(experimentStepIndex) },
    });
    if (!userExperiment?.experiment_id) {
        logger.error('[测试模式] 未找到用户实验中的关联的experimentId');
        redirect('/dashboard');
    }

    const { trails: experimentImageList, experiment_state: experimentState } =
        await getExperimentInfos(userExperimentId, parseInt(experimentStepIndex));
    const isExperimentFinished = experimentState == 'FINISHED';

    const platformSetting = await getAccessKey();
    const displayNum = platformSetting?.display_num || 1;

    const startTime = Math.floor(
        new Date(userExperiment?.start_time || new Date()).getTime() / 1000
    );

    const {
        countdown: countDownTime,
        title: stepTitle,
        content: stepContent,
        picMode: isPicMode,
    } = await getExperimentStepSetting(parseInt(userExperiment.experiment_id), experimentStepIndex);

    logger.info(`[测试模式] 实验倒计时: ${countDownTime} 分钟，开始时间: ${startTime}`);

    return (
        <div className="bg-white container max-w-[1024px] mx-auto h-screen py-4 px-16 flex flex-col">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-800 mb-2 flex-shrink-0">
                测试模式
            </div>
            <div className="flex flex-col h-full gap-4">
                <div className="flex min-h-[45%] overflow-visible">
                    <ImageList
                        experimentImageList={experimentImageList}
                        displayNum={displayNum}
                        isPicMode={isPicMode}
                    />
                </div>
                <div className="flex-1 min-h-[45%] flex flex-col">
                    <ExperimentEditor
                        nanoId={userExperimentId}
                        experimentNanoId={userExperimentId}
                        part={parseInt(experimentStepIndex)}
                        guest={false}
                        isExperimentFinished={isExperimentFinished}
                        experimentImageList={experimentImageList}
                        stepTitle={stepTitle}
                        stepContent={stepContent}
                        isTestMode={true}
                    />
                    <div className="flex gap-8 items-center justify-end mt-4 flex-shrink-0">
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
                            isExperimentFinished={isExperimentFinished}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
