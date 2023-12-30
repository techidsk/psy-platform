import { ExperimentCreateForm } from "@/components/experiment/experiment-create-form";
import { ExperimentCreateHeader } from "@/components/experiment/experiment-create-header";

export default async function ExperimentDetail({ params: { id } }: any) {

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <div className='flex flex-col gap-4'>
                <ExperimentCreateHeader heading="创建新实验" />
                <ExperimentCreateForm className="w-full px-2" nanoId={id} />
            </div>
        </div>
    );
}