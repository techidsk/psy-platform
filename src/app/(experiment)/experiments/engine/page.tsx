import { db } from '@/lib/db';
import { ExperimentStyles } from '@/components/experiment/experiment-styles';
import { ExperimentConfirm } from '@/components/experiment/experiment-confirm';
import { ExperimentConfirmButton } from '@/components/experiment/experiment-confirm-button';
import { ExperimentConfirmInfo } from '@/components/experiment/experiment-confirm-info';
import { getId } from '@/lib/nano-id';

async function getEngines() {
    const engines = await db.psy_engine.findMany({
        where: {

        }
    })

    let formatResult = engines.map(engine => {
        return {
            ...engine,
            id: engine.id.toString(),
            engine_description: engine.engine_description ?? undefined,
            state: Boolean(engine.state)
        }
    })
    return formatResult
}

// 用户选择出图引擎
export default async function ExperimentEngine() {
    const engines = await getEngines()

    const nanoId = getId()

    return (
        <div className='h-screen bg-white'>
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl lg:text-3xl text-center mb-12'>
                    请在以下三种图片中选择最令您感到舒适的图片
                </h3>
                <ExperimentStyles engines={engines} />
            </div>
            <div className='container mx-auto px-8 py-8 flex flex-col justify-center items-center gap-12'>
                <ExperimentConfirm header={<ExperimentConfirmInfo />}>
                    <ExperimentConfirmButton goto={`/test/input/${nanoId}`} />
                </ExperimentConfirm>
            </div>
        </div>
    )
}
