import { logger } from './logger';

require('dotenv').config();

const url = `http://${process.env.CELERY_HOST}/create_task`;

// 超时配置（毫秒）
const CREATE_TASK_TIMEOUT = 30000; // 创建任务超时 30 秒
const GET_RESULT_TIMEOUT = 10000; // 获取结果超时 10 秒

/**
 * 转发到ComfyUI生成接口
 * @param {any} data - The data to send to the generation service.
 * @returns {Promise<any>} - The response data from the service.
 * @throws {Error} - If an error occurs during the fetch request.
 */
async function generate(data: any) {
    logger.debug(`Sending data to ComfyUI: ${JSON.stringify(data)}`);
    try {
        logger.info(`Sending data to ComfyUI: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: data }),
            signal: AbortSignal.timeout(CREATE_TASK_TIMEOUT),
        });
        if (!response.ok) {
            // 尝试获取更多错误信息
            const errorBody = await response.text();
            const message = `An error has occurred: ${response.status} ${errorBody}`;
            throw new Error(message);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            logger.error(`创建生成任务超时 (${CREATE_TASK_TIMEOUT}ms)`);
            throw new Error(`创建生成任务超时`);
        }
        logger.error(`Failed to send data to ComfyUI: ${error}`);
        throw error;
    }
}

async function getGenerateResult(task_id: string) {
    if (!task_id || task_id === undefined) {
        return {
            status: 'failed',
            message: 'task_id is empty or undefined',
        };
    }

    try {
        const result_url = `http://${process.env.CELERY_HOST}/get_result/${task_id}`;
        const response = await fetch(result_url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-cache',
            signal: AbortSignal.timeout(GET_RESULT_TIMEOUT),
        });
        const res = await response.json();
        if (res.status === 'completed') {
            try {
                const result = await fetch(
                    `http://${process.env.CELERY_HOST}/get_result/${res.result}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache',
                        signal: AbortSignal.timeout(GET_RESULT_TIMEOUT),
                    }
                );
                const result_data = await result.json();
                return result_data;
            } catch (fetchError) {
                if (fetchError instanceof Error && fetchError.name === 'TimeoutError') {
                    logger.error(`获取生成结果详情超时 (${GET_RESULT_TIMEOUT}ms)`);
                    return {
                        status: 'failed',
                        message: '获取生成结果详情超时',
                    };
                }
                logger.error(`Failed to get result data: ${fetchError}`);
                return {
                    status: 'failed',
                    message: fetchError instanceof Error ? fetchError.message : String(fetchError),
                };
            }
        }
        return res;
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            logger.error(`获取生成结果超时 (${GET_RESULT_TIMEOUT}ms)`);
            return {
                status: 'failed',
                message: '获取生成结果超时',
            };
        }
        logger.error(`Failed to get data from ComfyUI: ${error}`);
        return {
            status: 'failed',
            message: error instanceof Error ? error.message : String(error),
        };
    }
}

export { generate, getGenerateResult };
