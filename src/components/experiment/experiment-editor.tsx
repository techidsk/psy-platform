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
    const [activePolls, setActivePolls] = useState<Set<string>>(new Set());
    const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

    // 用于追踪组件是否已挂载，防止组件卸载后继续更新状态
    const isMountedRef = useRef<boolean>(true);
    // 用于存储当前活跃的轮询任务ID，便于在卸载时清理
    const activePollsRef = useRef<Set<string>>(new Set());

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        // 检查 loading (短暂的文本提交状态) 或 activePolls 的大小
        // 如果 loading 为 true 或同时有两个任务在轮询，则阻止 Enter 键触发新的提交
        if (event.key === 'Enter' && (loading || activePolls.size >= 2)) {
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

    // 带重试的fetch请求
    async function fetchWithRetry(
        url: string,
        options: RequestInit,
        maxRetries: number = 5,
        baseDelay: number = 1000
    ): Promise<Response> {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);
                return response;
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    logger.warn(`网络请求失败，${delay}ms 后第 ${attempt + 1} 次重试: ${error}`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }

    // 带重试的状态更新
    async function updateTrailWithRetry(
        data: Record<string, any>,
        maxRetries: number = 3
    ): Promise<boolean> {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(getUrl('/api/trail/update'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    cache: 'no-store',
                });
                if (response.ok) {
                    return true;
                }
                logger.warn(
                    `状态更新请求失败 (${response.status})，重试 ${attempt + 1}/${maxRetries}`
                );
            } catch (error) {
                logger.warn(`状态更新网络错误，重试 ${attempt + 1}/${maxRetries}: ${error}`);
            }
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
        logger.error('状态更新失败，已达最大重试次数');
        return false;
    }

    async function pollForResult(promptNanoId: string, requestId: string) {
        // 使用 ref 检查是否已经在轮询，避免依赖 state 导致的闭包问题
        if (activePollsRef.current.has(promptNanoId)) {
            return; // 如果已经在轮询，则直接返回
        }

        // 检查requestId是否有效
        if (!requestId || requestId === 'undefined') {
            logger.error(`Invalid requestId: ${requestId} for promptNanoId: ${promptNanoId}`);
            if (isMountedRef.current) {
                toast({
                    title: '生成失败',
                    description: '无效的任务ID，请重试',
                    variant: 'destructive',
                    duration: 3000,
                });
            }
            return;
        }

        // 更新 ref 和 state
        activePollsRef.current.add(promptNanoId);
        if (isMountedRef.current) {
            setIsGenerating(true);
            setActivePolls((prev) => new Set(prev).add(promptNanoId));
        }

        const startTime = Date.now();
        const timeout = 60000;
        let networkErrorCount = 0;
        const MAX_NETWORK_ERRORS = 5;

        // 使用递归函数进行轮询
        const fetchResult = async (): Promise<any> => {
            // 检查组件是否已卸载
            if (!isMountedRef.current) {
                logger.info(`组件已卸载，停止轮询 ${promptNanoId}`);
                return null;
            }

            // 超时检查
            if (Date.now() - startTime > timeout) {
                await updateTrailWithRetry({
                    promptNanoId: promptNanoId,
                    guestNanoId: guestNanoId,
                    nano_id: experimentId,
                    state: 'TIMEOUT',
                });

                if (isMountedRef.current) {
                    toast({
                        title: '生成超时',
                        description: '图片生成超时，请重试或联系管理员',
                        variant: 'destructive',
                        duration: 3000,
                    });
                }

                return null;
            }

            try {
                const response = await fetchWithRetry(
                    getUrl(`/api/generate/${requestId}`),
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store',
                    },
                    3, // 每次轮询最多重试3次
                    500
                );

                // 检查组件是否已卸载
                if (!isMountedRef.current) {
                    return null;
                }

                let response_json: any;
                try {
                    response_json = await response.json();
                } catch (parseError) {
                    logger.error(`解析响应JSON失败: ${parseError}`);
                    networkErrorCount++;
                    if (networkErrorCount >= MAX_NETWORK_ERRORS) {
                        await updateTrailWithRetry({
                            promptNanoId: promptNanoId,
                            guestNanoId: guestNanoId,
                            nano_id: experimentId,
                            state: 'FAILED',
                        });
                        if (isMountedRef.current) {
                            toast({
                                title: '生成失败',
                                description: '服务器响应异常，请重试',
                                variant: 'destructive',
                                duration: 3000,
                            });
                        }
                        return null;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return fetchResult();
                }

                // 重置网络错误计数
                networkErrorCount = 0;

                if (response_json.status === 'error') {
                    await updateTrailWithRetry({
                        promptNanoId: promptNanoId,
                        guestNanoId: guestNanoId,
                        nano_id: experimentId,
                        state: 'FAILED',
                    });

                    if (isMountedRef.current) {
                        toast({
                            title: '生成失败',
                            description: '图片生成失败，请重试或联系管理员',
                            variant: 'destructive',
                            duration: 3000,
                        });
                    }

                    return null;
                }

                if (response_json.status !== 'success') {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return fetchResult(); // 递归调用直到成功
                }

                return response_json;
            } catch (error) {
                networkErrorCount++;
                logger.error(`轮询网络错误 (${networkErrorCount}/${MAX_NETWORK_ERRORS}): ${error}`);

                if (networkErrorCount >= MAX_NETWORK_ERRORS) {
                    await updateTrailWithRetry({
                        promptNanoId: promptNanoId,
                        guestNanoId: guestNanoId,
                        nano_id: experimentId,
                        state: 'FAILED',
                    });

                    if (isMountedRef.current) {
                        toast({
                            title: '网络错误',
                            description: '无法连接服务器，请检查网络后刷新页面',
                            variant: 'destructive',
                            duration: 5000,
                        });
                    }

                    return null;
                }

                // 等待后继续轮询
                await new Promise((resolve) => setTimeout(resolve, 2000));
                return fetchResult();
            }
        };

        // 更新图像到trail
        try {
            const finalResponse = await fetchResult();

            if (finalResponse && isMountedRef.current) {
                const updateSuccess = await updateTrailWithRetry({
                    promptNanoId: promptNanoId,
                    guestNanoId: guestNanoId,
                    nano_id: experimentId,
                    imageUrl: finalResponse.data.image_url,
                    prompt: finalResponse.data.chat_result,
                });

                if (updateSuccess) {
                    if (isMountedRef.current) {
                        router.refresh();
                    }
                } else if (isMountedRef.current) {
                    toast({
                        title: '保存失败',
                        description: '图片已生成但保存失败，请刷新页面',
                        variant: 'destructive',
                        duration: 5000,
                    });
                }

                // Remove the ID from generatingIds after successful update
                if (isMountedRef.current) {
                    setGeneratingIds((prevIds) =>
                        prevIds.filter((id) => id.nano_id !== promptNanoId)
                    );
                }
            }
        } catch (error) {
            logger.error('Failed to update trail:', error);
            if (isMountedRef.current) {
                setGeneratingIds((prevIds) => prevIds.filter((id) => id.nano_id !== promptNanoId));
            }
        } finally {
            // 总是从 ref 中移除，即使组件已卸载
            activePollsRef.current.delete(promptNanoId);

            // 仅在组件仍然挂载时更新 state
            if (isMountedRef.current) {
                setIsGenerating(false);
                setActivePolls((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(promptNanoId);
                    return newSet;
                });
                setGeneratingIds((prevIds) => prevIds.filter((id) => id.nano_id !== promptNanoId));
            }
        }
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
            setLoading(false); // 如果因为频率限制而阻止，也需要重置loading状态
            return;
        }

        // 检查当前活动的轮询任务数量
        if (activePolls.size >= 2) {
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
            nano_id: nanoId, // 本次实验id
            promptNanoId: promptNanoId,
            guestNanoId: guestNanoId,
            guest: guest,
            part: part,
        };
        // 判断是否是正式实验
        if (experimentId) {
            data['experimentId'] = experimentId;
        }

        // 创建trail记录
        try {
            const trailResponse = await fetch(getUrl('/api/trail'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
        }

        ref.current!.value = '';
        setLoading(false);
        router.refresh();
        setLastSubmitTime(Date.now()); // 更新最后提交时间

        // 发送请求，然后等待轮训刷新页面
        await generate(promptNanoId, data.nano_id);
    }

    // 更新trail状态为失败的辅助函数
    async function updateTrailToFailed(promptNanoId: string) {
        try {
            await fetch(getUrl('/api/trail/update'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptNanoId: promptNanoId,
                    guestNanoId: guestNanoId,
                    nano_id: experimentId,
                    state: 'FAILED',
                }),
                cache: 'no-store',
            });
        } catch (error) {
            logger.error(`更新trail状态失败: ${error}`);
        }
    }

    async function generate(promptNanoId: string, expNanoId: string, retryCount: number = 0) {
        const MAX_RETRIES = 3;

        try {
            // 发送请求生成图片
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
                // 生成成功，轮训获取最新结果
                // 判断是否是无图模式，需要轮训结果
                const response_msg = await response.json();
                if (response_msg.msg !== '不需要生成图片') {
                    // 检查返回的request_id是否有效
                    if (!response_msg.request_id || response_msg.request_id === 'undefined') {
                        logger.error(`无效的request_id: ${response_msg.request_id}`);
                        // 更新trail状态为失败
                        await updateTrailToFailed(promptNanoId);
                        toast({
                            title: '生成失败',
                            description: '服务器返回了无效的任务ID，请重试',
                            variant: 'destructive',
                            duration: 3000,
                        });
                        return;
                    }

                    // add to generatingIds
                    setGeneratingIds((prevIds) => {
                        if (!prevIds.some((id) => id.nano_id === promptNanoId)) {
                            return [
                                ...prevIds,
                                { nano_id: promptNanoId, request_id: response_msg.request_id },
                            ];
                        }
                        return prevIds;
                    });

                    // 开始轮询结果
                    pollForResult(promptNanoId, response_msg.request_id);
                }
            } else {
                // 生成失败，尝试重试
                if (retryCount < MAX_RETRIES) {
                    logger.warn(`生成请求失败，第 ${retryCount + 1} 次重试...`);
                    // 指数退避重试
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
                    );
                    return generate(promptNanoId, expNanoId, retryCount + 1);
                }

                // 重试次数用尽，更新trail状态为失败
                logger.error(`生成请求失败，已重试 ${MAX_RETRIES} 次`);
                await updateTrailToFailed(promptNanoId);
                toast({
                    title: '发送失败',
                    description: '未能成功生成图片，请继续输入',
                    variant: 'destructive',
                    duration: 3000,
                });
            }
        } catch (error) {
            // 网络错误，尝试重试
            if (retryCount < MAX_RETRIES) {
                logger.warn(`生成请求网络错误，第 ${retryCount + 1} 次重试: ${error}`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                return generate(promptNanoId, expNanoId, retryCount + 1);
            }

            // 重试次数用尽，更新trail状态为失败
            logger.error(`生成请求网络错误，已重试 ${MAX_RETRIES} 次: ${error}`);
            await updateTrailToFailed(promptNanoId);
            toast({
                title: '网络错误',
                description: '无法连接服务器，请检查网络后重试',
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
                    .filter((item) => item.request_id !== '')
            );
        }
    }, [experimentImageList]);

    // 组件挂载/卸载管理
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            // 组件卸载时设置标识
            isMountedRef.current = false;
            // 清理所有活跃的轮询任务引用
            activePollsRef.current.clear();
            logger.info('组件卸载，停止所有轮询任务');
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
    // 移除 activePolls 依赖，使用 ref 进行检查避免重复触发
    useEffect(() => {
        generatingIds.forEach((id) => {
            // 使用 ref 检查，避免依赖 activePolls state
            if (!activePollsRef.current.has(id.nano_id)) {
                pollForResult(id.nano_id, id.request_id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatingIds]);

    useEffect(() => {
        // 在组件加载时，检查是否有未完成的生成任务
        async function checkPendingGenerations() {
            try {
                // 查询所有状态为GENERATING的trail
                const response = await fetch(getUrl(`/api/trail/pending?nano_id=${nanoId}`));
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.trails && data.trails.length > 0) {
                        // 设置正在生成的ID列表
                        const pendingTrails = data.trails.map((trail: any) => ({
                            nano_id: trail.nano_id,
                            request_id: trail.request_id,
                        }));

                        setGeneratingIds(pendingTrails);

                        // 为每个待处理的trail启动轮询
                        pendingTrails.forEach((trail: any) => {
                            if (trail.request_id && trail.request_id !== 'undefined') {
                                pollForResult(trail.nano_id, trail.request_id);
                            }
                        });
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
