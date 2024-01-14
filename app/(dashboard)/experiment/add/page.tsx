import { ExperimentCreateForm } from '@/components/experiment/experiment-create-form';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ExperimentEditButton } from '@/components/experiment/experiment-edit-button';
import { getId } from '@/lib/nano-id';

export default async function CreateExperiment({ searchParams }: any) {
    const id = getId();

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <SubpageHeader>
                <ExperimentEditButton className="btn btn-primary btn-sm" edit={true} />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="创建新实验" />
                <ExperimentCreateForm
                    className="w-full px-2"
                    edit={true}
                    experiment={null}
                    nano_id={id}
                />
            </div>
        </div>
    );
}
