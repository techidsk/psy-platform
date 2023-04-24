'use client'
import { useState, useRef, useEffect } from 'react'
import { usePreExperimentState } from '@/state/_pre_atoms'
import { useRouter } from 'next/navigation'
import store from 'store2'
import { getId } from '@/lib/nano-id'
import { toast } from "@/hooks/use-toast"

interface ExperimentEditorProps {
    back: string
    nanoId: string
    trail?: boolean
}

type FetchData = {
    prompt?: string;
    engine_id?: string;
    nano_id: string; // experiment
    experimentId?: string;
    promptNanoId?: string
}

export function ExperimentEditor({
    back,
    nanoId,
    trail = true
}: ExperimentEditorProps) {
    const router = useRouter()
    const ref = useRef<HTMLTextAreaElement>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [engineId, setEngineId] = useState<string>()
    const [experimentId, setExperimentId] = useState<string>()
    const currentEngine = usePreExperimentState(state => state.engine)

    async function getExperimentInfo(nano_id: string) {
        await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/experiment/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                nano_id: nano_id
            })
        }).then(r => r.json())
            .then(data => {
                if (data?.engine_id) {
                    setEngineId(data.engine_id)
                } else {
                    router.push(back)
                }
            })
    }

    useEffect(() => {
        if (currentEngine?.id) {
            setEngineId(currentEngine.id)
        } else {
            getExperimentInfo(nanoId)
        }
    }, [])

    useEffect(() => {
        if (!trail) {
            let tempExperimentId = store('experimentId')
            if (!tempExperimentId) {
                router.push('dashboard')
            } else {
                setExperimentId(tempExperimentId)
            }
        }
    }, [])


    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的按键行为
            setLoading(true) // submit后改为false
            submit()
        }
    }

    async function submit() {
        if (!nanoId) {
            return
        }
        let value = ref.current?.value.trim()
        if (!value) {
            return
        }
        if (value.length < 5) {
            return toast({
                title: "输入文字过少",
                description: "请至少输入5个字符",
                variant: "destructive",
                duration: 3000
            })
        }

        let promptNanoId = getId()
        let data: FetchData = {
            prompt: value,
            engine_id: engineId,
            nano_id: nanoId, // 本次实验id
            promptNanoId: promptNanoId
        }
        // 判断是否是正式实验
        if (!trail && experimentId) {
            data['experimentId'] = experimentId
        }

        let url = process.env.NEXT_PUBLIC_BASE_URL + '/api/trail'
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store'
        })
        ref.current!.value = '';
        setLoading(false)
        router.refresh()
        let generateUrl = process.env.NEXT_PUBLIC_BASE_URL + '/api/generate'
        await fetch(generateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store'
        })
        router.refresh()
    }

    return (

        <>
            <textarea
                ref={ref}
                className={loading ? 'input-textarea read-only' : 'input-textarea'}
                // value={text} onChange={handleChange} 
                onKeyDown={handleKeyDown}
                readOnly={loading}
                placeholder='请在文本框内输入，“今天天气真不错”，并按下回车。'
            />
            <button className='btn btn-primary' onClick={submit}>
                提交
            </button>
        </>
    )

}