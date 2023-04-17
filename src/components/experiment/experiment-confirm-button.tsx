'use client'
import { useRouter } from 'next/navigation';
import { usePreExperimentState } from '@/state/_pre_atoms'

interface ExperimentConfirmProps extends React.HTMLAttributes<HTMLButtonElement> {
    goto: string
}


export function ExperimentConfirmButton({
    goto
}: ExperimentConfirmProps) {

    const router = useRouter()
    const selectedEngine = usePreExperimentState(state => state.engine)
    function start() {
        router.push(goto)
    }

    return selectedEngine && <button className='btn btn-primary' onClick={start}>开始测验</button>
}