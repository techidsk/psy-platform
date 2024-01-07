'use client';
import { useState, useRef, useEffect } from 'react';
import { usePreExperimentState } from '@/state/_pre_atoms';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { getId } from '@/lib/nano-id';
import { toast } from '@/hooks/use-toast';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';

interface ExperimentEditorProps {
    back: string;
    nanoId: string;
    trail?: boolean;
    experimentList?: ImageResponse[];
}

type FetchData = {
    prompt?: string;
    engine_id?: string;
    nano_id: string; // experiment
    experimentId?: string;
    promptNanoId?: string;
};

export function ExperimentEditor({
    back, //
    nanoId,
    trail = true,
    experimentList,
}: ExperimentEditorProps) {
    const router = useRouter();
    const ref = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [engineId, setEngineId] = useState<string>();
    const [experimentId, setExperimentId] = useState<string>();

    const currentEngine = usePreExperimentState((state) => state.engine);
    console.log(currentEngine);
    /**
     * 获取本次实验的引擎id，如果为空，就跳转到dashboard
     * @param nano_id 用户实验id
     */
    async function getExperimentInfo(nano_id: string) {
        if (!nano_id) {
            router.push(back);
        }
        await fetch(getUrl('/api/experiment/log'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nano_id: nano_id }),
        })
            .then((r) => r.json())
            .then((data) => {
                console.log(data);
                if (data?.engine_id) {
                    setEngineId(data.engine_id);
                } else {
                    router.push(back);
                }
            });
    }

    useEffect(() => {
        // 获取引擎id
        if (currentEngine?.id) {
            setEngineId(currentEngine.id);
        } else {
            getExperimentInfo(nanoId);
        }
    }, []);

    useEffect(() => {
        if (!trail) {
            let tempExperimentId = store('experimentId');
            if (!tempExperimentId) {
                // router.push('/dashboard');
            } else {
                setExperimentId(tempExperimentId);
            }
        }
    }, []);

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的按键行为
            setLoading(true); // submit后改为false
            submit();
        }
    }

    async function submit() {
        if (!nanoId) {
            return;
        }
        let value = ref.current?.value.trim();
        if (!value) {
            return;
        }
        if (value.length < 5) {
            return toast({
                title: '输入文字过少',
                description: '请至少输入5个字符',
                variant: 'destructive',
                duration: 3000,
            });
        }

        let promptNanoId = getId();
        let data: FetchData = {
            prompt: value,
            engine_id: engineId,
            nano_id: nanoId, // 本次实验id
            promptNanoId: promptNanoId,
        };

        console.log(data, trail);
        // 判断是否是正式实验
        if (!trail && experimentId) {
            data['experimentId'] = experimentId;
        }

        await fetch(getUrl('/api/trail'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
        });

        ref.current!.value = '';
        setLoading(false);
        router.refresh();
        await generate(promptNanoId, data.nano_id, engineId || '');
    }

    async function generate(promptNanoId: string, experimentId: string, engineId: string) {
        // 发送请求生成图片
        let response = await fetch(getUrl(`/api/generate/`), {
            method: 'POST',
            body: JSON.stringify({
                id: promptNanoId,
                engineId: engineId,
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        let d = await response.json();
        console.log('upload data is :', d);
        if (response.ok) {
            await fetch(getUrl('/api/upload/oss'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    promptNanoId: promptNanoId,
                    imageUrl: d.url,
                    nano_id: experimentId,
                }),
                cache: 'no-store',
            });
            router.refresh();
        } else {
            toast({
                title: '发送失败',
                description: d.msg,
                variant: 'destructive',
                duration: 3000,
            });
        }
    }

    return (
        <>
            <textarea
                ref={ref}
                className={loading ? 'input-textarea read-only' : 'input-textarea'}
                // value={text} onChange={handleChange}
                onKeyDown={handleKeyDown}
                readOnly={loading}
                placeholder="请在文本框内输入，“今天天气真不错”，并按下回车。"
            />
            <button className="btn btn-primary" onClick={submit}>
                提交
            </button>
        </>
    );
}
