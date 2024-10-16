import { notFound } from 'next/navigation';
import { dateFormat } from '@/lib/date';
import { ImageResponse } from '@/types/experiment';
import { db } from './db';
import { logger } from './logger';

interface ExperimentStep {
    countdown: number;
    title: string;
    content: string;
    picMode: boolean;
}

/**
 * 获取实验倒计时, 从 experiment_step 中获取
 *
 * @param {number} experimentId - The ID of the experiment to retrieve countdown time for.
 * @return {number} The countdown time for the specified experiment, defaulting to 1200 if not found.
 */
async function getExperimentStepSetting(
    experimentId: number,
    order: string
): Promise<ExperimentStep> {
    const experimentStep = await db.$queryRaw<any[]>`
        SELECT *
        FROM (
            SELECT *, ROW_NUMBER() over (order by "order") as num
            FROM experiment_steps
            WHERE experiment_id = ${experimentId}
            ORDER BY "order"
        ) AS subquery
        WHERE num = ${parseInt(order)}
    `;
    if (!experimentStep || experimentStep.length === 0) {
        logger.error(`experimentId: ${experimentId}-${order} 实验不存在 @experiment.ts`);
        return {
            countdown: 20,
            title: '',
            content: '',
            picMode: false,
        };
    }

    const stepContent = experimentStep[0]?.content as any;

    let countdown = stepContent?.countdown;
    let title = stepContent?.title;
    let content = stepContent?.content;
    let picMode = stepContent?.pic_mode;
    return {
        countdown: countdown ?? 20,
        title: title,
        content: content,
        picMode: picMode,
    };
}

/**
 * 查询用户当前实验
 *
 * @param {string} userId - The ID of the user.
 * @param {string} experimentId - The ID of the experiment.
 * @return {Promise<any>} The experiment associated with the user ID and experiment ID, or undefined if not found.
 */
async function getCurrentUserExperiment(
    userId: string,
    experimentId: string,
    part: string
): Promise<any> {
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
        where: { user_id: user.id, nano_id: experimentId, part: parseInt(part) },
    });

    return experiment;
}

async function getExperimentInfos(experimentId: string, part: number) {
    if (!experimentId) {
        return {
            trails: [],
            experiment_state: 'IN_EXPERIMENT',
        };
    }

    const userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: experimentId, part: part },
    });

    if (!userExperiment) {
        return {
            trails: [],
            experiment_state: 'IN_EXPERIMENT',
        };
    }

    const state = userExperiment.state;

    // 获取用户实验prompt信息
    const result = await db.trail.findMany({
        where: { user_experiment_id: experimentId, part: part },
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
            nano_id: e.nano_id?.toString() || '',
            request_id: e.request_id || '',
        };
    });
    return {
        trails: formatResult,
        experiment_state: state,
    };
}

/**
 * 确保路径以 "/" 结尾
 */
function _ensureTrailingSlash(path: string) {
    return path.endsWith('/') ? path : path + '/';
}

/**
 * 获取编码后的回调URL
 *
 * @param callback  - The callback URL to encode.
 * @param experimentStepIndex - The index of the experiment step.
 * @param userExperimentNanoId  - The nano ID of the user experiment.
 * @returns The encoded callback URL.
 */
function getEncodedCallbackUrl(
    callback: string,
    experimentStepIndex: string,
    userExperimentNanoId?: string
) {
    const nextStepIndex = parseInt(experimentStepIndex) + 1;
    let baseParams = `step_idx=${encodeURIComponent(nextStepIndex)}`;
    if (userExperimentNanoId) {
        baseParams += `&nano_id=${encodeURIComponent(userExperimentNanoId)}`;
    }
    // 保证路径以 "/" 结尾
    const normalizedPath = _ensureTrailingSlash(callback);
    const callbackUrl = `${encodeURIComponent(normalizedPath)}?${baseParams}`;
    logger.info(`callbackUrl: ${callbackUrl}`);
    return callbackUrl;
}

export {
    getExperimentStepSetting,
    getCurrentUserExperiment,
    getExperimentInfos,
    getEncodedCallbackUrl,
};
