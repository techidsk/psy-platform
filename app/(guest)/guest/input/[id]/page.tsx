import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentEditor } from '@/components/experiment/experiment-editor';
import { ImageList } from '@/components/experiment/image-list';
import { ImageListServer } from '@/components/experiment/image-list-server';
import { ExperimentFinishButton } from '@/components/experiment/experiment-finish-button';
import { CountDown } from '@/components/countdown';
import { getCountDownTime, getExperiment, getExperimentInfos } from '@/lib/experiment';
import { getAccessKey } from '@/lib/platform';
import { logger } from '@/lib/logger';

export default async function GuestInput({
    params: { id },
    searchParams,
}: {
    params: { id: string };
    searchParams: { [key: string]: string };
}) {
    const userExperimentId = searchParams['e'];
    const guestNanoId = id;

    const userExperiment = await getExperiment(guestNanoId, userExperimentId);

    const list = await getExperimentInfos(userExperimentId);

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
        <div className="bg-white container max-w-[1024px] mx-auto h-[100vh] py-4 flex flex-col gap-4 justify-between">
            <div className="flex justify-between items-center gap-4 flex-1">
                <ImageList experimentList={list} displayNum={displayNum} />
            </div>
            <div className="flex-col-center gap-2">
                <ExperimentEditor
                    nanoId={userExperimentId}
                    trail={false}
                    experimentList={list}
                    displayNum={displayNum}
                    experimentNanoId={searchParams['e']}
                    guest={true}
                    guestNanoId={guestNanoId}
                />
                <div className="flex gap-8 items-center justify-end">
                    <CountDown
                        start={startTime}
                        limit={countDownTime}
                        nanoId={userExperimentId}
                        guest={true}
                    />
                    <ExperimentFinishButton
                        nanoId={userExperimentId}
                        guest={true}
                        experimentList={list}
                    />
                </div>
            </div>
        </div>
    );
}
