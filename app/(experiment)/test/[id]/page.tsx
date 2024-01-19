import { BackButton } from '@/components/back-button';
import { ExperimentStart } from '@/components/experiment/experiment-start';
import { getId } from '@/lib/nano-id';
import { db } from '@/lib/db';
import { ExperimentStartButton } from '@/components/experiment/experiment-start-button';

async function getExperiment(experiment_nano_id: string) {
    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: experiment_nano_id,
        },
    });
    if (!experiment) {
        throw new Error('实验不存在');
    }
    return experiment;
}

// 实验测试说明页面
export default async function TestExperiment({ params: { id } }: { params: { id: string } }) {
    const nanoId = getId();
    // TODO 获取用户当前实验
    const experiment = await getExperiment(id);
    console.log(experiment);
    if (!experiment.engine_id) {
        throw new Error('实验引擎不存在');
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <BackButton back="/dashboard" />
                <ExperimentStart title="预测试实验说明">
                    <ExperimentStartButton engineId={experiment.engine_id} nanoId={nanoId} />
                </ExperimentStart>
            </div>
        </div>
    );
}
