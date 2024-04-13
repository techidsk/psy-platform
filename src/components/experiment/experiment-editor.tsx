'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { getId } from '@/lib/nano-id';
import { toast } from '@/hooks/use-toast';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';
import { useExperimentState } from '@/state/_experiment_atoms';
import classNames from 'classnames';

interface ExperimentEditorProps {
    nanoId: string;
    back?: string;
    trail?: boolean;
    experimentList?: ImageResponse[];
    displayNum?: number;
    experimentNanoId?: string;
    guest?: boolean;
    guestNanoId?: string;
}

type FetchData = {
    prompt?: string;
    engine_id?: string;
    nano_id: string; // experiment
    experimentId?: string;
    promptNanoId?: string;
    projectGroupId?: string;
    trail?: boolean;
    guestNanoId?: string;
    guest?: boolean;
};

const LOG_INTERVAL = 100; // 记录日志的时间间隔
const UPLOAD_INTERVAL = 10000; // 上传日志的时间间隔

export function ExperimentEditor({
    nanoId,
    guestNanoId,
    trail = true,
    displayNum = 1,
    experimentNanoId = '',
    guest = false,
}: ExperimentEditorProps) {
    const router = useRouter();
    const ref = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [experimentId, setExperimentId] = useState<string>();

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (loading) {
            return;
        }
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
        // TODO 配置实验字数
        if (value.length < 5) {
            setLoading(false);
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
            nano_id: nanoId, // 本次实验id
            promptNanoId: promptNanoId,
            trail: trail,
            guestNanoId: guestNanoId,
            guest: guest,
        };
        // 判断是否是正式实验
        if (!trail && experimentId) {
            data['experimentId'] = experimentId;
        }
        await fetch(getUrl('/api/trail'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data }),
            cache: 'no-store',
        });

        ref.current!.value = '';
        setLoading(false);
        router.refresh();
        await generate(promptNanoId, data.nano_id);
    }

    async function generate(promptNanoId: string, experimentId: string) {
        // 发送请求生成图片
        let response = await fetch(getUrl(`/api/generate/`), {
            method: 'POST',
            body: JSON.stringify({
                id: promptNanoId,
                experimentId: experimentId,
                experimentNanoId: experimentNanoId,
                guest: guest,
                guestNanoId: guestNanoId,
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        let d = await response.json();
        if (response.ok) {
            await fetch(getUrl('/api/trail/update'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    promptNanoId: promptNanoId,
                    imageUrl: d.url,
                    nano_id: experimentId,
                    prompt: d.prompt,
                    guestNanoId: guestNanoId,
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

    // 记录用户实验日志
    async function logUserInput() {
        let value = ref.current?.value.trim();
        const datetime = new Date();
        const currentImages = useExperimentState.getState().currentImages;

        if (value === '' || value === undefined || value === null) {
            return;
        }

        if (currentImages[0] === '') {
            return;
        }

        const data = {
            images: currentImages,
            input: value,
            timestamp: datetime,
            experiment_id: nanoId,
        };

        const storageLogName = `userLogs_${nanoId}`;
        const logs = JSON.parse(store(storageLogName) || '[]');
        logs.push(data);
        store(storageLogName, JSON.stringify(logs));
    }

    // 添加日志记录
    async function uploadLogs() {
        const storageLogName = `userLogs_${nanoId}`;
        const logs = JSON.parse(store(storageLogName) || '[]');
        if (logs.length > 0) {
            fetch('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logs),
            })
                .then((response) => response.json())
                .then(() => {
                    store.remove(storageLogName); // 成功上传后清除本地存储中的日志
                    console.log('Logs uploaded successfully');
                })
                .catch((error) => console.error('Error uploading logs:', error));
        }
    }

    useEffect(() => {
        if (!trail) {
            const tempExperimentId = store('experimentId');
            if (!tempExperimentId) {
                // router.push('/dashboard');
            } else {
                setExperimentId(tempExperimentId);
            }
        }
    }, []);

    useEffect(() => {
        const logIntervalId = setInterval(() => {
            (async () => {
                await logUserInput();
            })();
        }, LOG_INTERVAL);

        const uploadIntervalId = setInterval(() => {
            (async () => {
                await uploadLogs();
            })();
        }, UPLOAD_INTERVAL);

        return () => {
            clearInterval(logIntervalId);
            clearInterval(uploadIntervalId);
        };
    }, []);

    return (
        <>
            <textarea
                ref={ref}
                className={classNames('input-textarea text-2xl cursor-auto', {
                    'read-only': loading,
                })}
                style={{ width: '67%', height: '9rem' }}
                // value={text} onChange={handleChange}
                onKeyDown={handleKeyDown}
                readOnly={loading}
                placeholder=""
            />
            {/* <button className="btn btn-primary" onClick={submit}>
                提交
            </button> */}
        </>
    );
}
