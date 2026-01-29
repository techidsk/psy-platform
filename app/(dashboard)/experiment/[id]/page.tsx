import { ExperimentCreateForm } from '@/components/experiment/experiment-create-form';

import { db } from '@/lib/db';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ExperimentEditButton } from '@/components/experiment/experiment-edit-button';
import { logger } from '@/lib/logger';

/**
 * 判断数据库是否存在,如果存在则进入编辑流程.
 * @param nanoId
 */
async function getExperiment(nanoId: string) {
    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: nanoId,
        },
    });

    if (!experiment) {
        logger.error(`未找到实验${nanoId}`);
        return null;
    }
    return experiment;
}

async function getEngines() {
    const engines = await db.engine.findMany({
        where: {
            state: 1,
        },
    });
    return engines;
}

async function getExperimentSteps(experimentId: number) {
    const steps = await db.experiment_steps.findMany({
        where: {
            experiment_id: experimentId,
        },
        orderBy: {
            order: 'asc',
        },
    });
    return steps;
}

export default async function ExperimentDetail({
    params,
    searchParams: searchParamsPromise,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { id } = await params;
    const searchParams = await searchParamsPromise;

    const experiment = await getExperiment(id);
    const engines = await getEngines();
    let steps = null;
    if (experiment && experiment.id) {
        steps = await getExperimentSteps(experiment.id);
    } else {
        logger.error('未找到实验{}', id);
    }

    const edit = searchParams.edit === 'true';

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                <ExperimentEditButton
                    className="btn btn-primary btn-sm"
                    edit={Boolean(edit)}
                    lock={experiment?.lock === 1}
                />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading={`${experiment?.id ? '编辑实验' : '创建新实验'}`} />
                <ExperimentCreateForm
                    className="w-full px-2"
                    edit={Boolean(edit)}
                    experiment={experiment}
                    nano_id={id}
                    engines={engines}
                    steps={steps}
                />
            </div>
        </div>
    );
}
