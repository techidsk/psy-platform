'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { usePreExperimentState } from '@/state/_pre_atoms'
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';

interface ExperimentFinishProps extends React.HTMLAttributes<HTMLButtonElement> {
    nanoId: string
    disable?: boolean
    experimentList: ImageResponse[]
}


export function ExperimentFinishButton({
    nanoId,
    experimentList,
}: ExperimentFinishProps) {


    const [disabled, setDisabled] = useState(true)
    const router = useRouter()
    const selectedEngine = usePreExperimentState(state => state.engine)

    useEffect(() => {
        if (experimentList.length > 0) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [experimentList])

    async function finish() {
        // 完成实验
        await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: nanoId
            })
        })

        router.push(`/experiments/result/${nanoId}`)
    }

    return <button className='btn btn-ghost btn-outline' disabled={disabled} onClick={finish}>完成实验</button>
}