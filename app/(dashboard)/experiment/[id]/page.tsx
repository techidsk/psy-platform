import { ExperimentCreateForm } from '@/components/experiment/experiment-create-form';

import { db } from '@/lib/db';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ExperimentEditButton } from '@/components/experiment/experiment-edit-button';

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
        console.log(`Experiment with nanoId: ${nanoId} not found.`);
        return null;
    }

    return experiment;
}

export default async function ExperimentDetail({ params: { id }, searchParams }: any) {
    const experiment = await getExperiment(id);
    const edit = searchParams.edit === 'true';

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <SubpageHeader>
                <ExperimentEditButton className="btn btn-primary btn-sm" edit={Boolean(edit)} />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading={`${experiment?.id ? '编辑实验' : '创建新实验'}`} />
                <ExperimentCreateForm
                    className="w-full px-2"
                    edit={Boolean(edit)}
                    experiment={experiment}
                    nano_id={id}
                />
            </div>
        </div>
    );
}
