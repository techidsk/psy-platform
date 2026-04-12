import { db } from '@/lib/db';
import { ExperimentDetailView } from '@/components/experiment/experiment-detail-view';
import { getCurrentUser } from '@/lib/session';
import { canEdit } from '@/lib/permissions';
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

export default async function ExperimentDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [experiment, engines, user] = await Promise.all([
        getExperiment(id),
        getEngines(),
        getCurrentUser(),
    ]);

    let steps = null;
    if (experiment && experiment.id) {
        steps = await getExperimentSteps(experiment.id);
    } else {
        logger.error('未找到实验{}', id);
    }

    const canUserEdit = canEdit(user?.role);
    const isSuperAdmin = user?.role === 'SUPERADMIN';

    return (
        <ExperimentDetailView
            canEdit={canUserEdit}
            isSuperAdmin={isSuperAdmin}
            lock={experiment?.lock === 1}
            experiment={experiment}
            nano_id={id}
            engines={engines}
            steps={steps}
        />
    );
}
