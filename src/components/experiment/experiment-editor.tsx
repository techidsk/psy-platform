'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { waitForGeneration } from '@/lib/wait-for-generation';
import { uploadLogBatch } from '@/lib/upload-log-batch';
import { getId } from '@/lib/nano-id';
import { toast } from '@/hooks/use-toast';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';
import { useExperimentState } from '@/state/_experiment_atoms';
import classNames from 'classnames';
import { logger } from '@/lib/logger';
import { Modal } from '@/components/ui/modal';
import { Icons } from '@/components/icons';

interface GenerateDebugInfo {
    styleTemplate: string | null;
    userInput: string;
    contextSummary: string | null;
    intentProfile: Record<string, unknown> | null;
    imageGuidance: string | null;
    assembledPrompt: string;
    assembledPromptLength: number;
}

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
    isTestMode?: boolean;
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
    isTestMode = false,
}: ExperimentEditorProps) {
    const [showTopicModal, setShowTopicModal] = useState<boolean>(false);
    const router = useRouter();
    const ref = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [experimentId, setExperimentId] = useState<string>();
    const localTasks = useRef(new Set<string>());
    const submitting = useRef(false);
    const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
    const [debugInfo, setDebugInfo] = useState<GenerateDebugInfo | null>(null);
    const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);

    // 用于追踪组件是否已挂载，防止组件卸载后继续更新状态
    const isMountedRef = useRef<boolean>(true);
    const activePreviews = useRef(new Set<string>());

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (
            event.key !== 'Enter' ||
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229
        )
            return;
        event.preventDefault();
        if (event.repeat || isExperimentFinished || submitting.current) return;
        void submit();
    }

    async function submit() {
        if (!nanoId) return;
        if (Date.now() - lastSubmitTime < 3000) {
            toast({
                title: '操作过于频繁',
                description: '请等待3秒后再提交。',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        const pending = new Set(localTasks.current);
        for (const item of experimentImageList) {
            if (item.state === 'GENERATING' && item.nano_id) pending.add(item.nano_id);
        }
        if (pending.size >= 2) {
            toast({
                title: '处理任务已达上限',
                description: '最多同时处理 2 个生成任务，请稍后再试。',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        const value = ref.current?.value.trim();
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

        submitting.current = true;
        setLoading(true);
        const promptNanoId = getId();
        const data: FetchData = {
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
                logger.error(
                    `创建trail失败: ${trailResponse.status} - ${JSON.stringify(errorData)}`
                );
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
        } finally {
            submitting.current = false;
        }

        if (!isMountedRef.current || !ref.current) return;
        ref.current.value = '';
        setLoading(false);
        router.refresh();
        setLastSubmitTime(Date.now());

        await generate(promptNanoId, data.nano_id);
    }

    async function generate(promptNanoId: string, expNanoId: string) {
        localTasks.current.add(promptNanoId);
        try {
            const result = await waitForGeneration(
                () =>
                    fetch(getUrl('/api/generate'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: promptNanoId,
                            experimentId: expNanoId,
                            experimentNanoId,
                            guest,
                            guestNanoId,
                            part,
                        }),
                    }),
                () => isMountedRef.current
            );
            if (!isMountedRef.current || !result) return;
            if (result.url) {
                activePreviews.current.add(promptNanoId);
                useExperimentState.getState().setPreviewUrl(promptNanoId, result.url);
            }
            if (isTestMode && result.debug) setDebugInfo(result.debug);
        } catch (error) {
            if (isMountedRef.current)
                toast({
                    title: '图片状态更新失败',
                    description: error instanceof Error ? error.message : '请查看历史记录',
                    variant: 'destructive',
                });
        } finally {
            localTasks.current.delete(promptNanoId);
            if (isMountedRef.current) router.refresh();
        }
    }

    // 记录用户实验日志
    async function logUserInput() {
        const value = ref.current?.value.trim();
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
        try {
            await uploadLogBatch(storageLogName);
        } catch (error) {
            logger.error(`上传日志失败: ${error}`);
        }
    }

    useEffect(() => {
        const { previewUrls, setPreviewUrl } = useExperimentState.getState();
        for (const item of experimentImageList) {
            if (item.nano_id && item.state !== 'GENERATING' && previewUrls[item.nano_id]) {
                activePreviews.current.delete(item.nano_id);
                setPreviewUrl(item.nano_id, null);
            }
        }
    }, [experimentImageList]);

    const hasPending = experimentImageList.some((item) => item.state === 'GENERATING');
    useEffect(() => {
        if (!hasPending) return;
        const timer = setInterval(() => router.refresh(), 8000);
        return () => clearInterval(timer);
    }, [hasPending, router]);

    // 组件挂载/卸载管理
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            // 组件卸载时设置标识
            isMountedRef.current = false;
            for (const id of activePreviews.current) {
                useExperimentState.getState().setPreviewUrl(id, null);
            }
            activePreviews.current.clear();
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

            {/* 测试模式调试面板 */}
            {isTestMode && debugInfo && (
                <div className="mt-2 flex-shrink-0">
                    <button
                        className="text-xs text-gray-500 hover:text-gray-700 mb-1"
                        onClick={() => setShowDebugPanel((v) => !v)}
                    >
                        {showDebugPanel ? '▼' : '▶'} 生成调试信息
                    </button>
                    {showDebugPanel && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono space-y-2 max-h-[300px] overflow-y-auto">
                            <div>
                                <span className="text-gray-500">风格模板：</span>
                                <span>{debugInfo.styleTemplate || '(空)'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">用户输入：</span>
                                <span>{debugInfo.userInput}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">上下文摘要：</span>
                                <span className={debugInfo.contextSummary ? '' : 'text-orange-500'}>
                                    {debugInfo.contextSummary || '(空 - 首次提交无历史)'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">图像指导(intent)：</span>
                                <span className={debugInfo.imageGuidance ? 'text-blue-600' : ''}>
                                    {debugInfo.imageGuidance || '(空)'}
                                </span>
                            </div>
                            {debugInfo.intentProfile && (
                                <div>
                                    <span className="text-gray-500">完整意图画像：</span>
                                    <pre className="mt-1 bg-white p-2 rounded border text-[11px] whitespace-pre-wrap">
                                        {JSON.stringify(debugInfo.intentProfile, null, 2)}
                                    </pre>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <span className="text-gray-500">
                                    最终提示词 ({debugInfo.assembledPromptLength}字)：
                                </span>
                                <div className="mt-1 bg-white p-2 rounded border whitespace-pre-wrap break-all">
                                    {debugInfo.assembledPrompt}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
