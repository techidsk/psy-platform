'use client';

import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUrl } from '@/lib/url';
import { useExperimentState } from '@/state/_experiment_atoms';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        let fiveMinWarningShown = false;
        let tenSecWarningShown = false;
        const calculateTimeLeft = () =>
            Math.max(0, start + limit * 60 - Math.floor(Date.now() / 1000));

        async function finishExperimentStep() {
            try {
                const finished = await useExperimentState.getState().finishStep(nanoId, part);
                if (active && finished) router.push(decodeURIComponent(callbackUrl));
            } catch (error) {
                if (active)
                    toast({
                        title: '到时提交失败，请点击完成写作重试',
                        description: error instanceof Error ? error.message : undefined,
                        variant: 'destructive',
                    });
            }
        }

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 300 && newTimeLeft > 0 && !fiveMinWarningShown) {
                fiveMinWarningShown = true;
                toast({
                    title: '写作倒计时',
                    description: '还剩5分钟结束',
                    variant: 'destructive',
                    duration: 10000,
                });
            }

            if (newTimeLeft <= 10 && newTimeLeft > 0 && !tenSecWarningShown) {
                tenSecWarningShown = true;
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

        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [start, limit, nanoId, part, callbackUrl, router]);

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
