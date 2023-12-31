import { BackButton } from '@/components/back-button';
import { ExperimentStart } from '@/components/experiment/experiment-start';
import { NextButton } from '@/components/next-button';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import Link from 'next/link';
import { getId } from '@/lib/nano-id';

async function getUserDefaultEngine(userId: string) {
    const userSetting = await db.user_setting.findFirst({
        where: {
            user_id: parseInt(userId)
        }
    })
    let engine = undefined
    if (userSetting?.engine_id) {
        engine = await db.engine.findFirst({
            where: {
                id: userSetting.engine_id
            }
        })
    }
    return engine
}

// 实验测试说明页面
export default async function TestStart() {
    const currentUser = await getCurrentUser()
    let engine = undefined
    if (currentUser) {
        engine = await getUserDefaultEngine(currentUser?.id)
    }
    const nanoId = getId()

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <BackButton back='/dashboard' />
                <ExperimentStart title='预测试实验说明'>
                    {
                        Boolean(engine?.id) && <Link className='btn btn-ghost' href={`/experiments/input/${nanoId}`} >
                            <button>直接开始</button>
                        </Link>
                    }
                    <NextButton goto='/experiments/engine' text='选择引擎' />
                </ExperimentStart>
            </div>
        </div>
    )
}
