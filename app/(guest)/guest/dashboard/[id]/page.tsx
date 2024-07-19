import { redirect } from 'next/navigation';
import { findCallbackUserExperiment, getUserGroupExperiments } from '@/lib/user_experiment';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';
import { logger } from '@/lib/logger';

interface GuestDashboardProps {
    params: {
        id: string; // 游客的nanoId 前16位是 游客的nanoId，后21位是游客的inviteCode
    };
    searchParams: { [key: string]: string };
}

async function getExperiment(userNanoId: string, inviteCode: string, userExperimentNanoId: string) {
    let nextExperimentId = 0;
    let userId = 0;
    let experiment_status = '';
    try {
        if (userExperimentNanoId !== '') {
            // 从Callback进入实验,证明实验并未完成
            logger.info('<临时用户> 从Callback进入实验');
            let response = await findCallbackUserExperiment(userNanoId, userExperimentNanoId);
            nextExperimentId = response?.experiment_id || 0;
            userId = response?.user_id || 0;
        } else {
            let response = await getUserGroupExperiments(true, userNanoId, inviteCode);
            nextExperimentId = response?.experiment_id || 0;
            userId = response?.user_id || 0;
            experiment_status = response?.experiment_status;

            if (nextExperimentId == 0) {
                logger.error(`<临时用户${userNanoId}> 没有可用的实验`);
                redirect('/guest/closed/30001');
            }

            if (experiment_status == 'FINISH') {
                logger.error(`<临时用户${userNanoId}> 已经完成实验`);
                redirect('/guest/closed/30003');
            }

            logger.info(`<临时用户${userNanoId}> 需要进行实验${nextExperimentId}`);

            if (!userId) {
                logger.error(`<临时用户${userNanoId}> 未找到合法userId`);
                redirect('/guest/closed/30002');
            }
        }
    } catch (error: Error | any) {
        logger.error(`处理用户实验时发生错误: ${error.message}`);
        // 根据实际需求处理错误，比如重定向到错误页面或者返回错误信息
    }

    return { nextExperimentId, userId };
}

export default async function GuestDashboard({
    params: { id },
    searchParams,
}: GuestDashboardProps) {
    // 获取用户默认的实验
    const userNanoId = id.slice(0, 16); // 游客的nanoId
    const inviteCode = id.slice(16, 37); // 游客实验的inviteCode

    // 用户进入实验,如果没有信息，则获取分组默认实验，否则则通过url callback的实验信息获取
    const currentIndex = searchParams['step_idx'] ? parseInt(searchParams['step_idx']) : 1;
    const userExperimentNanoId = searchParams['nano_id'] || ''; // 本次实验的 nanoId， user_experiment表中

    const { nextExperimentId, userId } = await getExperiment(
        userNanoId,
        inviteCode,
        userExperimentNanoId
    );

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
