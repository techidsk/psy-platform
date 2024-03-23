import { ExperimentCreateForm } from '@/components/experiment/experiment-create-form';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ExperimentEditButton } from '@/components/experiment/experiment-edit-button';
import { getId } from '@/lib/nano-id';
import { db } from '@/lib/db';

async function getEngines() {
    const engines = await db.engine.findMany({
        where: {
            state: 1,
        },
    });
    return engines;
}
export default async function CreateExperiment({ searchParams }: any) {
    const id = getId();
    const engines = await getEngines();

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                <ExperimentEditButton className="btn btn-primary btn-sm" edit={true} />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="创建新实验" />
                <ExperimentCreateForm
                    className="w-full px-2"
                    edit={true}
                    experiment={null}
                    engines={engines}
                    nano_id={id}
                    add={true}
                />
            </div>
        </div>
    );
}
