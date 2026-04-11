import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';

interface TestExperimentProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string }>;
}

export default async function TestExperimentPage({
    params,
    searchParams: searchParamsPromise,
}: TestExperimentProps) {
    const { id: experimentNanoId } = await params;
    const searchParams = await searchParamsPromise;

    const user = await getCurrentUser();
    if (!user) {
        redirect('/');
    }

    // 通过 nano_id 直接查找实验，跳过 project/group 链路
    const experiment = await db.experiment.findFirst({
        where: { nano_id: experimentNanoId },
    });

    if (!experiment) {
        logger.error(`[测试模式] 实验 ${experimentNanoId} 不存在`);
        redirect('/dashboard');
    }

    const currentIndex = searchParams['step_idx'] ? parseInt(searchParams['step_idx']) : 1;
    const userExperimentNanoId = searchParams['nano_id'] || '';

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    测试模式 — 实验: {experiment.experiment_name}
                </div>
                <ExperimentTimeline
                    nextExperimentId={experiment.id}
                    userId={parseInt(user.id)}
                    guest={false}
                    test={true}
                    testExperimentNanoId={experimentNanoId}
                    stepIndex={currentIndex}
                    userExperimentNanoId={userExperimentNanoId}
                />
            </div>
        </div>
    );
}
