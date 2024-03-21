'use client';

import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CountDownProp {
    start: number; // 开始的时间戳
    limit: number; // 限制的时间 是分钟数
    nanoId: string;
    guest?: boolean;
}

export function CountDown({ start, limit, nanoId, guest = false }: CountDownProp) {
    const router = useRouter();
    usePageLeave();
    const calculateTimeLeft = () => {
        const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
        const endTime = start + limit * 60; // 结束时间戳（秒）
        const timeLeft = endTime - currentTime; // 剩余时间（秒）
        return timeLeft > 0 ? timeLeft : 0; // 如果时间已过，返回0
    };

    // 设置初始剩余时间
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    async function finish(redirect: boolean = true) {
        await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nanoId }),
        });
        const resultUrl = guest ? `/guest/result/${nanoId}` : `/result/${nanoId}`;
        redirect && router.push(resultUrl);
    }

    useEffect(() => {
        // 如果时间已过，就不再设置定时器
        if (timeLeft < 300 && timeLeft > 290) {
            // 弹窗说明项目已经结束
            toast({
                title: '写作倒计时',
                description: '还剩5分钟结束',
                variant: 'destructive',
                duration: 10000,
            });
        }
        if (timeLeft < 10) {
            // 弹窗说明项目已经结束
            toast({
                title: '完成任务倒计时',
                description: `还剩${timeLeft}秒钟结束`,
                variant: 'destructive',
                duration: 3000,
            });
        }
        if (timeLeft === 0) {
            // 弹窗说明项目已经结束
            logger.info('倒计时结束，结束实验');
            finish();
            return;
        }

        // 更新剩余时间的定时器
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft === 0) {
                clearInterval(timer); // 如果时间到，清除定时器
            }
            setTimeLeft(newTimeLeft); // 更新状态
        }, 1000); // 每秒更新一次

        // 清理函数：组件卸载时清除定时器
        return () => clearInterval(timer);
    }, [timeLeft]);

    function usePageLeave() {
        useEffect(() => {
            const handleBeforeUnload = (event: any) => {
                logger.info('离开倒计时页面，结束实验');
                finish(false);

                // 在这里，我们不设置任何阻止用户离开的逻辑，
                // 如需询问用户是否真的想要离开，可以设置 event.returnValue
                // event.returnValue = '你确定要离开吗？';
            };

            // 添加事件监听器
            window.addEventListener('beforeunload', handleBeforeUnload);

            // 返回一个清理函数，在组件卸载时执行
            return () => {
                // 移除事件监听器
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }, []); // 确保依赖项正确，以便正确地响应变化
    }

    // useEffect(() => {
    //     return () => {
    //         logger.info('离开倒计时页面，结束实验');
    //         finish(false);
    //     };
    // }, []);

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    // 将剩余时间转换为时分秒
    const minutes = formatTime(Math.floor((timeLeft % 3600) / 60));
    const seconds = formatTime(Math.round(timeLeft) % 60); // 取余数，保证数字始终是两位数，例如：59秒转换为“59timeLeft % 60;
    // 格式化时间显示，保证数字始终是两位数

    return (
        <span className="countdown font-mono text-2xl">
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
