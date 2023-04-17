import { BackButton } from '@/components/back-button';
import { ExperimentStart } from '@/components/experiment/experiment-start';
import { NextButton } from '@/components/next-button';



// 实验测试说明页面
export default async function TestStart() {

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <BackButton back='/experiment' />
                <ExperimentStart>
                    <NextButton goto='/test/select' />
                </ExperimentStart>
            </div>
        </div>
    )
}
