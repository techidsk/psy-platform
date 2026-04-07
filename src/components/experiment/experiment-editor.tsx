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
import { logger } from '@/lib/logger';
import { Modal } from '@/components/ui/modal';
import { Icons } from '@/components/icons';

interface ExperimentEditorProps {
    nanoId: string;
    back?: string;
    experimentNanoId?: string;
    guest?: boolean;
    guestNanoId?: string;
    part?: number;
    isExperimentFinished?: boolean;
    experimentImageList: ImageResponse[];
    stepTitle?: string;
    stepContent?: string;
}

type FetchData = {
    prompt?: string;
    engine_id?: string;
    nano_id: string; // experiment
    experimentId?: string;
    promptNanoId?: string;
    projectGroupId?: string;
    guestNanoId?: string;
    guest?: boolean;
    part?: number;
};

// 日志记录间隔优化：
// - LOG_DEBOUNCE_DELAY: 用户停止输入后多久记录一次（防抖）
// - LOG_MAX_INTERVAL: 即使用户持续输入，也最多间隔这么久记录一次
// - UPLOAD_INTERVAL: 上传日志到服务器的间隔
const LOG_DEBOUNCE_DELAY = 500; // 用户停止输入后 500ms 记录
const LOG_MAX_INTERVAL = 3000; // 最长 3 秒记录一次
const UPLOAD_INTERVAL = 10000; // 上传日志的时间间隔

export function ExperimentEditor({
    nanoId,
    guestNanoId,
    experimentNanoId = '',
    part = 0,
    guest = false,
    isExperimentFinished = false,
    experimentImageList,
    stepTitle = '',
    stepContent = '',
}: ExperimentEditorProps) {
    const [showTopicModal, setShowTopicModal] = useState<boolean>(false);
    const router = useRouter();
    const ref = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [experimentId, setExperimentId] = useState<string>();
    const [generatingIds, setGeneratingIds] = useState<{ nano_id: string; request_id: string }[]>(
        []
    );
    const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

    // 用于追踪组件是否已挂载，防止组件卸载后继续更新状态
    const isMountedRef = useRef<boolean>(true);

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        // 检查 loading (短暂的文本提交状态) 或 generatingIds 的数量
        // 如果 loading 为 true 或同时有两个任务在轮询，则阻止 Enter 键触发新的提交
        if (event.key === 'Enter' && (loading || generatingIds.length >= 2)) {
            event.preventDefault(); // 阻止 Enter 键的默认行为（换行）和我们的 submit 调用
            console.warn('Previous submission loading or 2 tasks are polling. Cannot submit now.'); // 临时log
            toast({
                title: loading ? '正在提交上一个请求' : '处理任务已达上限',
                description: loading ? '请稍后再试' : '最多同时处理 2 个生成任务，请稍后再试。',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        // 如果是 Enter 键，并且不是 loading 且轮询任务少于2个，则正常提交
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的换行行为
            if (Date.now() - lastSubmitTime < 3000) {
                toast({
                    title: '操作过于频繁',
                    description: '请等待3秒后再提交。',
                    variant: 'destructive',
                    duration: 3000,
                });
                return;
            }
            setLoading(true); // 开始短暂的文本提交 loading
            submit();
        }

        // 对于非 Enter 键，不做任何阻止，允许用户自由输入
    }

    async function submit() {
        if (!nanoId) {
            return;
        }

        if (Date.now() - lastSubmitTime < 3000) {
            toast({
                title: '操作过于频繁',
                description: '请等待3秒后再提交。',
                variant: 'destructive',
                duration: 3000,
            });
            setLoading(false);
            return;
        }

        if (generatingIds.length >= 2) {
            toast({
                title: '处理任务已达上限',
                description: '最多同时处理 2 个生成任务，请稍后再试。',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        let value = ref.current?.value.trim();
        if (!value) {
            return;
        }

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
            nano_id: nanoId,
            promptNanoId: promptNanoId,
            guestNanoId: guestNanoId,
            guest: guest,
            part: part,
        };
        if (experimentId) {
            data['experimentId'] = experimentId;
        }

        try {
            const trailResponse = await fetch(getUrl('/api/trail'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data }),
                cache: 'no-store',
            });

            if (!trailResponse.ok) {
                const errorData = await trailResponse.json().catch(() => ({}));
                logger.error(`创建trail失败: ${trailResponse.status} - ${JSON.stringify(errorData)}`);
                toast({
                    title: '提交失败',
                    description: errorData.msg || '无法保存内容，请重试',
                    variant: 'destructive',
                    duration: 3000,
                });
                setLoading(false);
                return;
            }
        } catch (error) {
            logger.error(`创建trail网络错误: ${error}`);
            toast({
                title: '网络错误',
                description: '无法连接服务器，请检查网络后重试',
                variant: 'destructive',
                duration: 3000,
            });
            setLoading(false);
            return;
        }

        ref.current!.value = '';
        setLoading(false);
        router.refresh();
        setLastSubmitTime(Date.now());

        await generate(promptNanoId, data.nano_id);
    }

    async function generate(promptNanoId: string, expNanoId: string, retryCount: number = 0) {
        const MAX_RETRIES = 3;

        if (isMountedRef.current) {
            setGeneratingIds((prev) => {
                if (!prev.some((id) => id.nano_id === promptNanoId)) {
                    return [...prev, { nano_id: promptNanoId, request_id: '' }];
                }
                return prev;
            });
            setIsGenerating(true);
        }

        try {
            // 发送请求生成图片（同步调用，后端直接返回结果）
            const response = await fetch(getUrl(`/api/generate`), {
                method: 'POST',
                body: JSON.stringify({
                    id: promptNanoId,
                    experimentId: expNanoId,
                    experimentNanoId: experimentNanoId,
                    guest: guest,
                    guestNanoId: guestNanoId,
                    part: part,
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const response_msg = await response.json();
                if (response_msg.msg !== '不需要生成图片') {
                    // 后端已更新 trail，直接刷新页面
                    if (isMountedRef.current) {
                        router.refresh();
                    }
                }
            } else {
                if (retryCount < MAX_RETRIES) {
                    logger.warn(`生成请求失败，第 ${retryCount + 1} 次重试...`);
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
                    );
                    return generate(promptNanoId, expNanoId, retryCount + 1);
                }
                logger.error(`生成请求失败，已重试 ${MAX_RETRIES} 次`);
                if (isMountedRef.current) {
                    toast({
                        title: '生成失败',
                        description: '图片生成失败，请重试',
                        variant: 'destructive',
                        duration: 3000,
                    });
                }
            }
        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                logger.warn(`生成请求网络错误，第 ${retryCount + 1} 次重试: ${error}`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                return generate(promptNanoId, expNanoId, retryCount + 1);
            }
            logger.error(`生成请求网络错误，已重试 ${MAX_RETRIES} 次: ${error}`);
            if (isMountedRef.current) {
                toast({
                    title: '网络错误',
                    description: '无法连接服务器，请检查网络后重试',
                    variant: 'destructive',
                    duration: 3000,
                });
            }
        } finally {
            if (isMountedRef.current) {
                setGeneratingIds((prev) => prev.filter((id) => id.nano_id !== promptNanoId));
                setIsGenerating(false);
            }
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
            part: part,
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
                })
                .catch((error) => console.error('Error uploading logs:', error));
        }
    }

    // 获取未完成的图片id
    useEffect(() => {
        if (experimentImageList.length > 0) {
            setGeneratingIds(
                experimentImageList
                    .filter((item) => item.state === 'GENERATING')
                    .map((item) => ({
                        nano_id: item.nano_id || '',
                        request_id: item.request_id || '',
                    }))
            );
        }
    }, [experimentImageList]);

    // 组件挂载/卸载管理
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            // 组件卸载时设置标识
            isMountedRef.current = false;
            logger.info('组件卸载，停止所有生成任务');
        };
    }, []);

    useEffect(() => {
        const tempExperimentId = store('experimentId');
        if (!tempExperimentId) {
            // router.push('/dashboard');
        } else {
            setExperimentId(tempExperimentId);
        }
    }, []);

    // 用于防抖日志记录的 refs
    const logDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastLogTimeRef = useRef<number>(0);
    const lastInputValueRef = useRef<string>('');

    // 防抖记录用户输入
    // 策略：用户停止输入 500ms 后记录，但最长 3 秒必须记录一次
    const debouncedLogUserInput = () => {
        const currentValue = ref.current?.value.trim() || '';

        // 如果内容没有变化，不记录
        if (currentValue === lastInputValueRef.current) {
            return;
        }

        const now = Date.now();
        const timeSinceLastLog = now - lastLogTimeRef.current;

        // 清除之前的防抖定时器
        if (logDebounceTimerRef.current) {
            clearTimeout(logDebounceTimerRef.current);
        }

        // 如果超过最大间隔，立即记录
        if (timeSinceLastLog >= LOG_MAX_INTERVAL) {
            lastInputValueRef.current = currentValue;
            lastLogTimeRef.current = now;
            logUserInput();
            return;
        }

        // 否则设置防抖定时器
        logDebounceTimerRef.current = setTimeout(() => {
            lastInputValueRef.current = ref.current?.value.trim() || '';
            lastLogTimeRef.current = Date.now();
            logUserInput();
        }, LOG_DEBOUNCE_DELAY);
    };

    // 监听输入变化，触发防抖日志记录
    useEffect(() => {
        const textarea = ref.current;
        if (!textarea) return;

        const handleInput = () => {
            debouncedLogUserInput();
        };

        textarea.addEventListener('input', handleInput);

        // 上传日志的定时器
        const uploadIntervalId = setInterval(() => {
            uploadLogs();
        }, UPLOAD_INTERVAL);

        return () => {
            textarea.removeEventListener('input', handleInput);
            clearInterval(uploadIntervalId);
            // 清理防抖定时器
            if (logDebounceTimerRef.current) {
                clearTimeout(logDebounceTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 当 generatingIds 变化时，启动新的轮询任务
    useEffect(() => {
        // 在组件加载时，检查是否有未完成的生成任务（页面刷新后恢复 loading 状态）
        async function checkPendingGenerations() {
            try {
                const response = await fetch(getUrl(`/api/trail/pending?nano_id=${nanoId}`));
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.trails && data.trails.length > 0) {
                        // 仅显示 loading 占位，不重新发起生成（同步调用无法恢复）
                        // 这些 trail 会由 /api/jobs 定时清理为 FAILED
                        const pendingTrails = data.trails.map((trail: any) => ({
                            nano_id: trail.nano_id,
                            request_id: '',
                        }));
                        setGeneratingIds(pendingTrails);
                    }
                }
            } catch (error) {
                console.error('Failed to check pending generations:', error);
            }
        }

        checkPendingGenerations();
    }, [nanoId]);

    return (
        <div className="flex flex-col w-full h-full">
            {/* 写作题目/要求按钮 - 输入框右上角 */}
            {(stepTitle || stepContent) && (
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button
                        className="btn btn-sm bg-primary text-white border-none shadow-md gap-1.5"
                        onClick={() => setShowTopicModal(true)}
                    >
                        <Icons.preview className="h-4 w-4" />
                        查看指导语
                    </button>
                </div>
            )}

            {/* 写作题目/要求 Modal */}
            {(stepTitle || stepContent) && (
                <Modal
                    open={showTopicModal}
                    onClose={() => setShowTopicModal(false)}
                    className="max-w-2xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {stepTitle ? `指导语：${stepTitle}` : '指导语'}
                        </h3>
                        <button
                            className="btn btn-sm btn-ghost btn-circle"
                            onClick={() => setShowTopicModal(false)}
                        >
                            <Icons.close className="h-4 w-4" />
                        </button>
                    </div>
                    {stepContent && (
                        <div
                            className="prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: stepContent }}
                        />
                    )}
                </Modal>
            )}

            <textarea
                ref={ref}
                className={classNames('input-textarea text-3xl cursor-auto flex-1 min-h-0 w-full', {
                    'read-only': isExperimentFinished || loading,
                })}
                onKeyDown={handleKeyDown}
                readOnly={isExperimentFinished || loading}
                placeholder=""
            />
        </div>
    );
}
