import { notFound } from 'next/navigation';
import { dateFormat } from '@/lib/date';
import { ImageResponse } from '@/types/experiment';
import { db } from './db';
import { logger } from './logger';
import { getUrl } from './url';

/**
 * 获取实验倒计时.
 *
 * @param {number} experimentId - The ID of the experiment to retrieve countdown time for.
 * @return {number} The countdown time for the specified experiment, defaulting to 1200 if not found.
 */
async function getCountDownTime(experimentId: number): Promise<number> {
    const experiment = await db.experiment.findFirst({
        where: { id: experimentId },
    });
    return experiment?.countdown || 20;
}

/**
 * 查询用户当前实验
 *
 * @param {string} userId - The ID of the user.
 * @param {string} experimentId - The ID of the experiment.
 * @return {Promise<any>} The experiment associated with the user ID and experiment ID, or undefined if not found.
 */
async function getCurrentUserExperiment(userId: string, experimentId: string): Promise<any> {
    // guest是nanoid 普通用户是id
    let user;
    if (typeof userId !== 'string') {
        user = await db.user.findFirst({
            where: { id: userId },
        });
    } else {
        user = await db.user.findFirst({
            where: { nano_id: userId },
        });
    }

    if (!user) {
        logger.error(`userId: ${userId} 用户不存在 @experiment.ts`);
        return notFound();
    }

    const experiment = await db.user_experiments.findFirst({
        where: { user_id: user.id, nano_id: experimentId },
    });

    return experiment;
}

async function getExperimentInfos(experimentId: string) {
    if (!experimentId) {
        return [];
    }

    // 获取用户实验prompt信息
    const result = await db.trail.findMany({
        where: { user_experiment_id: experimentId },
    });

    const formatResult: ImageResponse[] = result.map((e, idx) => {
        return {
            id: e.id.toString(),
            prompt: e.prompt || undefined,
            state: e.state || undefined,
            create_time: e.create_time ? dateFormat(e.create_time) : undefined,
            update_time: e.update_time ? dateFormat(e.update_time) : undefined,
            image_url: e.image_url || '',
            idx: idx,
        };
    });
    return formatResult;
}

export { getCountDownTime, getCurrentUserExperiment as getExperiment, getExperimentInfos };
