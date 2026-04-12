'use client';

import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUrl } from '@/lib/url';
import { useExperimentState } from '@/state/_experiment_atoms';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface CountDownProp {
    start: number; // 开始的时间戳
    limit: number; // 限制的时间 是分钟数
    nanoId: string;
    mini?: boolean;
    part: number;
    callbackUrl: string;
}

export function CountDown({ start, limit, nanoId, part, callbackUrl, mini = true }: CountDownProp) {
    const router = useRouter();

    const calculateTimeLeft = () => {
        const currentTime = Math.floor(Date.now() / 1000);
        const endTime = start + limit * 60;
        const timeLeft = endTime - currentTime;
        return timeLeft > 0 ? timeLeft : 0;
    };

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const fiveMinWarningShown = useRef(false);
    const tenSecWarningShown = useRef(false);
    const finishCalled = useRef(false);

    async function finishExperimentStep() {
        if (finishCalled.current) return;
        finishCalled.current = true;

        const won = useExperimentState.getState().setIsFinishing();
        if (!won) {
            logger.info('另一个完成请求已经在进行中，跳过');
            return;
        }

        const result = await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nanoId, part: part }),
        });

        if (!result.ok) {
            toast({
                title: '未完成写作任务',
                description: `未找到任何写作内容，请重新实验`,
                variant: 'destructive',
                duration: 3000,
            });
            router.back();
            return;
        }

        const decodeUrl = decodeURIComponent(callbackUrl);
        logger.info(`实验已超时，跳转到${decodeUrl}`);
        router.push(decodeUrl);
    }

    // 单一 interval 处理倒计时和 toast 提醒
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 300 && newTimeLeft > 0 && !fiveMinWarningShown.current) {
                fiveMinWarningShown.current = true;
                toast({
                    title: '写作倒计时',
                    description: '还剩5分钟结束',
                    variant: 'destructive',
                    duration: 10000,
                });
            }

            if (newTimeLeft <= 10 && newTimeLeft > 0 && !tenSecWarningShown.current) {
                tenSecWarningShown.current = true;
                toast({
                    title: '完成任务倒计时',
                    description: `还剩不到10秒钟结束`,
                    variant: 'destructive',
                    duration: 3000,
                });
            }

            if (newTimeLeft === 0) {
                clearInterval(timer);
                logger.info('倒计时结束，结束实验');
                finishExperimentStep();
            }
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 页面关闭时通过 sendBeacon 发送完成请求
    useEffect(() => {
        const handleBeforeUnload = () => {
            const won = useExperimentState.getState().setIsFinishing();
            if (!won) return;

            const url = getUrl('/api/experiment/finish');
            const body = JSON.stringify({ id: nanoId, part: part });
            const blob = new Blob([body], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [nanoId, part]);

    // 询问用户是否离开页面
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    const t = timeLeft ?? 0;
    const hours = formatTime(Math.floor(t / 3600));
    const minutes = formatTime(Math.floor((t % 3600) / 60));
    const seconds = formatTime(Math.round(t) % 60);

    return mini ? (
        <span className="countdown font-mono text-2xl">
            <StyleSpan value={minutes} />:
            <StyleSpan value={seconds} />
        </span>
    ) : (
        <span className="countdown font-mono text-3xl">
            <StyleSpan value={hours} />:
            <StyleSpan value={minutes} />:
            <StyleSpan value={seconds} />
        </span>
    );
}

function StyleSpan({ value }: { value: string }) {
    const spanStyle: React.CSSProperties & { '--value': string } = {
        '--value': `${value}`,
    };
    return <span style={spanStyle as React.CSSProperties}></span>;
}
