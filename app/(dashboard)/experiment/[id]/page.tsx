import { ExperimentCreateForm } from "@/components/experiment/experiment-create-form";
import { ExperimentCreateHeader } from "@/components/experiment/experiment-create-header";
import { Undo2 } from 'lucide-react'

import { db } from '@/lib/db';

/**
 * 判断数据库是否存在,如果存在则进入编辑流程.
 * @param nanoId 
 */
async function getExperiment(nanoId: string) {
    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: nanoId
        }
    })

    if (!experiment) {
        console.log(`Experiment with nanoId: ${nanoId} not found.`);
        return null;
    }

    return experiment
}



export default async function ExperimentDetail({ params: { id } }: any) {

    const experiment = await getExperiment(id)

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <div className="mb-4">
                <button className="btn btn-ghost">
                    <Undo2 />返回
                </button>
            </div>
            <div className='flex flex-col gap-4'>
                <ExperimentCreateHeader heading={`${experiment?.id ? "编辑实验" : "创建新实验"}`} />
                <ExperimentCreateForm className="w-full px-2" experiment={experiment} nano_id={id} />
            </div>
        </div>
    );
}