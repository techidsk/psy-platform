import { P } from 'pino';
import { logger } from './logger';

require('dotenv').config();
// const url = `http://${process.env.COMFYUI_HOST_URL}/result`;
const url = `http://${process.env.CELERY_HOST}/create_task`;

/**
 * 转发到ComfyUI生成接口
 * @param {string} prompt - The prompt to send to the web UI.
 * @returns {Promise<any>} - The response data from the web UI.
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
        });
        if (!response.ok) {
            // 尝试获取更多错误信息
            const errorBody = await response.text();
            const message = `An error has occurred: ${response.status} ${errorBody}`;
            throw new Error(message);
        }

        return await response.json();
    } catch (error) {
        logger.error(`Failed to send data to ComfyUI: ${error}`);
        // 可以根据需要重新抛出错误或处理错误
        throw error; // 或者可以返回一个错误响应对象
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
        // let result_url = `http://${process.env.COMFYUI_HOST_URL}/status/${task_id}`;
        let result_url = `http://${process.env.CELERY_HOST}/get_result/${task_id}`;
        const response = await fetch(result_url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-cache',
        });
        const res = await response.json();
        if (res.status === 'completed') {
            const result = await fetch(
                `http://${process.env.CELERY_HOST}/get_result/${res.result}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache',
                }
            );
            const result_data = await result.json();
            return result_data;
        }
        return res;
    } catch (error) {
        logger.error(`Failed to get data from ComfyUI: ${error}`);
        // 可以根据需要重新抛出错误或处理错误
        return {
            status: 'failed',
            message: error,
        };
    }
}

export { generate, getGenerateResult };
