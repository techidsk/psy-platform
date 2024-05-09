import { redirect } from 'next/navigation';
import { getUserGroupExperiments } from '@/lib/user_experiment';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';
import { logger } from '@/lib/logger';

interface GuestDashboardProps {
    params: {
        id: string; // 游客的nanoId 前16位是 游客的nanoId，后21位是游客的inviteCode
    };
    searchParams: { [key: string]: string };
}

export default async function GuestDashboard({
    params: { id },
    searchParams,
}: GuestDashboardProps) {
    // 获取用户默认的实验
    const currentIndex = searchParams['step_idx'] ? parseInt(searchParams['step_idx']) : 1;
    const userExperimentNanoId = searchParams['nano_id'] || ''; // 本次实验的 nanoId， user_experiment表中

    const userNanoId = id.slice(0, 16); // 游客的nanoId
    const inviteCode = id.slice(16, 37); // 游客实验的inviteCode

    const { experiment_id: nextExperimentId, user_id: userId } = await getUserGroupExperiments(
        true,
        userNanoId,
        inviteCode
    );
    logger.info(`<临时用户${userNanoId}> 需要进行实验 ${nextExperimentId}`);

    if (!nextExperimentId) {
        logger.error(`<临时用户${userNanoId}> 没有可用的实验`);
        redirect('/guest/closed');
    }
    if (!userId) {
        logger.error(`<临时用户${userNanoId}> 未找到合法userId`);
        redirect('/guest/closed');
    }

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col gap-4">
                    <ExperimentTimeline
                        nextExperimentId={nextExperimentId}
                        userId={userId}
                        guest={true}
                        guestUserNanoId={userNanoId}
                        stepIndex={currentIndex}
                        userExperimentNanoId={userExperimentNanoId}
                    />
                </div>
            </div>
        </>
    );
}
