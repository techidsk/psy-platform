import { BackButton } from '@/components/back-button';
import { ExperimentStart } from '@/components/experiment/experiment-start';
import { NextButton } from '@/components/next-button';
import { getId } from '@/lib/nano-id';



// 正式开始实验
export default async function ExperimentsStart() {
    const nanoId = getId()

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <BackButton back='/dashboard' />
                <ExperimentStart title='正式实验说明'>
                    <NextButton goto={`/experiments/input/${nanoId}`} text='开始实验' />
                </ExperimentStart>
            </div>
        </div>
    )
}
