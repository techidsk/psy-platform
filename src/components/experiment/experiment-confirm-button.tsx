'use client'
import { useRouter } from 'next/navigation';
import { usePreExperimentState } from '@/state/_pre_atoms'
import { getId } from '@/lib/nano-id';
import { getUrl } from '@/lib/url';

interface ExperimentConfirmProps extends React.HTMLAttributes<HTMLButtonElement> {
    goto: string
}


export function ExperimentConfirmButton({
    goto
}: ExperimentConfirmProps) {

    const router = useRouter()
    const selectedEngine = usePreExperimentState(state => state.engine)
    const nanoId = getId()

    async function start() {
        if (selectedEngine?.id) {
            await fetch(getUrl('/api/user/setting'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    engineId: selectedEngine.id
                })
            })
            router.push(goto)
        } else {
            router.push('/experiments/engine')
        }
    }

    function startExperiment() {
        router.push(`/experiments/input/${nanoId}`)
    }

    return selectedEngine && <div className='flex gap-4'>
        <button className='btn btn-ghost' onClick={startExperiment}>直接开始</button>
        <button className='btn btn-primary' onClick={start}>开始教程</button>
    </div>
}