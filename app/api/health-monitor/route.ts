import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import cron from 'node-cron';

// Celery 长耗时任务检查的配置
const CELERY_HOST = process.env.HEALTH_CHECK_CELERY_HOST || process.env.CELERY_HOST;
const CREATE_TASK_PATH = '/create_task';
const GET_RESULT_PATH_PREFIX = '/get_result/';
const LONG_TASK_TIMEOUT_MS = process.env.HEALTH_CHECK_LONG_TASK_TIMEOUT_MS
    ? parseInt(process.env.HEALTH_CHECK_LONG_TASK_TIMEOUT_MS)
    : 30000;
const LONG_TASK_POLL_INTERVAL_MS = process.env.HEALTH_CHECK_LONG_TASK_POLL_INTERVAL_MS
    ? parseInt(process.env.HEALTH_CHECK_LONG_TASK_POLL_INTERVAL_MS)
    : 2000;

// 直接定义健康检查任务的 payload 对象
const healthCheckTaskPayload: any = {
    user_prompts: [
        {
            prompt: 'health check simple prompt for emoji test ✨',
            generate_prompt: null,
        },
    ],
    engine_id: 1, // 使用一个简单/默认的引擎ID
    gpt: {
        gpt_prompt: 'This is a health check prompt for Celery task with emoji fun 🥳.',
        gpt_setting: { max_tokens: 10, temperature: 0.5 }, // 最小化GPT设置
    },
    template: {
        // 根据您提供的JSON结构，template是一个对象
        prompt: '噪点渐变插画 🎨',
        negative_prompt: 'low quality, worst quality, bad anatomy',
    },
    user: {
        gender: '女性',
        ages: '18-30',
    },
    task_id: 'placeholder_will_be_replaced', // 将被nanoid覆盖
};
// 确保每次运行时 task_id 是唯一的
healthCheckTaskPayload.task_id = nanoid();

// Webhook 配置 (飞书)
const WEBHOOK_URL =
    process.env.NOTIFICATION_WEBHOOK_URL ||
    'https://open.feishu.cn/open-apis/bot/v2/hook/936d62f0-b764-4a61-8877-b3f6dddd7aea';

// --- 定时任务配置 ---
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const HEALTH_CHECK_CRON_SCHEDULE = process.env.HEALTH_CHECK_CRON_SCHEDULE || '0 */4 * * *'; // 每4小时执行一次

if (process.env.NODE_ENV !== 'test') {
    // 避免在测试环境中意外运行 cron
    if (cron.validate(HEALTH_CHECK_CRON_SCHEDULE)) {
        console.log(
            `[定时任务 ✅] 健康检查已计划，将按照 cron 表达式 "${HEALTH_CHECK_CRON_SCHEDULE}" 执行。`
        );
        cron.schedule(HEALTH_CHECK_CRON_SCHEDULE, async () => {
            const cronTriggerTime = new Date().toISOString();
            console.log(
                `[定时任务 🚀] ${cronTriggerTime} - 触发健康检查 API: ${APP_BASE_URL}/api/health-monitor`
            );
            try {
                const response = await fetch(`${APP_BASE_URL}/api/health-monitor`, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'CronJob-HealthChecker/1.0',
                        'X-Cron-Triggered': 'true', // 添加header以便GET处理器识别
                    },
                });
                const responseBodyText = await response.text(); // 获取响应体用于日志
                if (!response.ok) {
                    console.error(
                        `[定时任务 ❌] 健康检查 API 调用失败。状态码: ${response.status}, 响应: ${responseBodyText.substring(0, 500)}`
                    );
                } else {
                    console.log(
                        `[定时任务 ✔️] 健康检查 API 调用成功。状态码: ${response.status}, 响应: ${responseBodyText.substring(0, 200)}...`
                    );
                }
            } catch (error: any) {
                console.error(
                    '[定时任务 🔥] 调用健康检查 API 时发生网络错误或异常:',
                    error.message
                );
            }
        });
    } else {
        console.error(
            `[定时任务 💀] 无效的 cron 表达式: "${HEALTH_CHECK_CRON_SCHEDULE}". 健康检查定时任务未启动。`
        );
    }
} else {
    console.log('[定时任务 😴] 检测到测试环境 (NODE_ENV=test)，健康检查定时任务已跳过。');
}

export async function GET(request?: Request) {
    const currentPayload = { ...healthCheckTaskPayload, task_id: nanoid() };

    if (!CELERY_HOST) {
        const errorMsg = '关键配置缺失：CELERY_HOST环境变量未设置，无法执行健康检查。😔';
        console.error(`[配置错误 🙁] ${errorMsg}`);
        await sendNotification('⚙️ 配置错误', errorMsg);
        return NextResponse.json(
            { status: 'error', check: 'configuration', message: errorMsg },
            { status: 500 }
        );
    }

    const celeryBaseUrl = CELERY_HOST.startsWith('http') ? CELERY_HOST : `http://${CELERY_HOST}`;
    const isCronTriggered = request?.headers.get('X-Cron-Triggered') === 'true';
    if (!isCronTriggered) {
        console.log(`[健康检查 🩺] 开始Celery服务 (${celeryBaseUrl}) 健康检查...`);
    }

    let clientGeneratedTaskId = currentPayload.task_id;
    let taskIdToUse: string | null = null;
    let taskStatusJson: any = null;
    let operationStage = '任务创建阶段 📝';

    try {
        console.log(
            `[健康检查 ➡️] 正在创建Celery任务，目标：${celeryBaseUrl}${CREATE_TASK_PATH}，客户端任务ID: ${clientGeneratedTaskId}`
        );
        const createTaskResponse = await fetch(`${celeryBaseUrl}${CREATE_TASK_PATH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'HealthMonitor/1.0 (Celery Task Create)',
            },
            body: JSON.stringify({ payload: currentPayload }),
            signal: AbortSignal.timeout(10000),
        });

        if (!createTaskResponse.ok) {
            const errorBody = await createTaskResponse.text();
            throw new Error(
                `服务响应异常 (状态码: ${createTaskResponse.status})。内容: ${errorBody.substring(0, 200)}...`
            );
        }

        const createTaskJson = await createTaskResponse.json();
        const celeryReturnedTaskId = createTaskJson.task_id || createTaskJson.id;

        if (celeryReturnedTaskId) {
            taskIdToUse = celeryReturnedTaskId;
            console.log(`[健康检查 ✨] Celery服务响应并返回任务ID: ${taskIdToUse}。`);
            if (celeryReturnedTaskId !== clientGeneratedTaskId) {
                console.warn(
                    `[健康检查 ⚠️] Celery返回的任务ID (${celeryReturnedTaskId}) 与客户端生成的 (${clientGeneratedTaskId}) 不同。优先使用Celery返回的ID。`
                );
            }
        } else {
            taskIdToUse = clientGeneratedTaskId;
            console.warn(
                `[健康检查 ❗️] Celery响应中未包含task_id/id，使用客户端ID: ${taskIdToUse}。响应: ${JSON.stringify(createTaskJson).substring(0, 200)}...`
            );
        }

        console.log(`[健康检查 ��]最终使用任务ID: ${taskIdToUse} 进行后续操作。`);

        operationStage = '任务状态轮询阶段 🔄';
        const startTime = Date.now();
        let finalResultId: string | null = null;

        while (Date.now() - startTime < LONG_TASK_TIMEOUT_MS) {
            console.log(`[健康检查 ⏳] 正在查询任务 ${taskIdToUse} 的状态...`);
            const getStatusUrl = `${celeryBaseUrl}${GET_RESULT_PATH_PREFIX}${taskIdToUse}`;
            const statusResponse = await fetch(getStatusUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'HealthMonitor/1.0 (Celery Task Poll)' },
                signal: AbortSignal.timeout(LONG_TASK_POLL_INTERVAL_MS + 2000),
                cache: 'no-cache',
            });

            if (!statusResponse.ok) {
                const errorBody = await statusResponse.text();
                throw new Error(
                    `查询任务 ${taskIdToUse} 状态失败 (状态码: ${statusResponse.status})。内容: ${errorBody.substring(0, 200)}...`
                );
            }

            taskStatusJson = await statusResponse.json();
            console.log(`[健康检查 📊] 任务 ${taskIdToUse} 当前状态:`, taskStatusJson.status);

            if (taskStatusJson.status && taskStatusJson.status.toLowerCase() === 'completed') {
                finalResultId = taskStatusJson.result;
                if (!finalResultId) {
                    throw new Error(
                        `任务 ${taskIdToUse} 初步完成，但响应中未找到最终结果ID (result)。状态: ${JSON.stringify(taskStatusJson).substring(0, 200)}...`
                    );
                }
                console.log(
                    `[健康检查 🎉] 任务 ${taskIdToUse} 初步处理完成。结果ID: ${finalResultId}`
                );
                break;
            }

            const failedStatus = ['failed', 'failure', 'revoked'];
            if (
                taskStatusJson.status &&
                failedStatus.includes(taskStatusJson.status.toLowerCase())
            ) {
                throw new Error(
                    `任务 ${taskIdToUse} 执行失败，报告状态为: ${taskStatusJson.status}。详情: ${JSON.stringify(taskStatusJson).substring(0, 200)}...`
                );
            }

            await new Promise((resolve) => setTimeout(resolve, LONG_TASK_POLL_INTERVAL_MS));
        }

        if (!finalResultId) {
            const lastStatusString =
                JSON.stringify(taskStatusJson || '未知').substring(0, 100) + '...';
            if (Date.now() - startTime >= LONG_TASK_TIMEOUT_MS) {
                throw new Error(
                    `处理超时 ⏱️: 任务 ${taskIdToUse} 未在 ${LONG_TASK_TIMEOUT_MS / 1000} 秒内完成初步处理。最后状态: ${lastStatusString}`
                );
            }
            throw new Error(
                `任务 ${taskIdToUse} 未能进入"已完成"状态以获取最终结果ID。最后状态: ${lastStatusString}`
            );
        }

        operationStage = '最终结果获取阶段 📥';
        console.log(
            `[健康检查 🔎] 正在获取任务 ${taskIdToUse} (结果ID: ${finalResultId}) 的最终结果...`
        );
        const finalResultUrl = `${celeryBaseUrl}${GET_RESULT_PATH_PREFIX}${finalResultId}`;
        const finalResultResponse = await fetch(finalResultUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'HealthMonitor/1.0 (Celery Final Result)' },
            signal: AbortSignal.timeout(10000),
            cache: 'no-cache',
        });

        if (!finalResultResponse.ok) {
            const errorBody = await finalResultResponse.text();
            throw new Error(
                `获取最终结果失败 (状态码: ${finalResultResponse.status})。内容: ${errorBody.substring(0, 200)}...`
            );
        }

        const finalResultJson = await finalResultResponse.json();
        console.log(
            `[健康检查 ✅] Celery任务 ${taskIdToUse} (结果ID: ${finalResultId}) 成功完成，最终结果已获取。`
        );

        const successSummary = '✅ 服务健康报告';
        const successDetails = `Celery服务 (${celeryBaseUrl}) 本次健康检查通过！测试任务 (ID: ${taskIdToUse}) 已成功执行并返回结果。一切看起来棒棒哒！🎉🚀`;
        console.log(successDetails);
        await sendNotification(successSummary, successDetails, taskIdToUse);
        return NextResponse.json({
            status: 'ok',
            check: 'celery_full_task',
            message: successDetails,
        });
    } catch (error: any) {
        const idForErrorReporting = taskIdToUse || clientGeneratedTaskId;
        let userFriendlyMessage;
        let detailedErrorMessage = error.message;
        let errorEmoji = '🔥'; // Default error emoji

        if (error.name === 'AbortError') {
            userFriendlyMessage = `操作超时 ⏱️，可能原因：服务响应过慢或网络不稳定。阶段：${operationStage}。`;
            detailedErrorMessage = `${userFriendlyMessage} (任务ID: ${idForErrorReporting})`;
            errorEmoji = '⌛️';
        } else {
            userFriendlyMessage = `服务检查时发生错误 🙁。阶段：${operationStage}。`;
            detailedErrorMessage = `${userFriendlyMessage} (任务ID: ${idForErrorReporting})。错误: ${error.message}`;
        }

        console.error(`[健康检查 ${errorEmoji}] 失败! ${detailedErrorMessage}`, error);
        const feishuErrorDetails =
            detailedErrorMessage.length > 300
                ? detailedErrorMessage.substring(0, 297) + '...'
                : detailedErrorMessage;
        await sendNotification(
            `❌ 服务异常报告 - ${operationStage}`,
            feishuErrorDetails,
            idForErrorReporting
        );

        return NextResponse.json(
            {
                status: 'error',
                check: operationStage,
                message: detailedErrorMessage,
                celeryHost: celeryBaseUrl,
                taskId: idForErrorReporting,
            },
            { status: 503 }
        );
    }
}

// 更新后的发送通知函数 (适配飞书)
async function sendNotification(summary: string, details: string, taskId?: string | null) {
    const notificationTitle = `[🩺 服务健康巡检] ${summary}`;
    let notificationBody = `�� **详情**：\n${details}`;
    if (taskId) {
        notificationBody += `\n🆔 **任务ID**：\`${taskId}\``;
    }
    notificationBody += `\n⏱️ **时间**：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    notificationBody += `\n🖥️ **目标主机**：\`${CELERY_HOST || '未配置'}\``;

    console.log(`准备发送飞书通知: ${notificationTitle}\n${notificationBody}`);

    if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('http')) {
        console.error('[飞书通知 🚫] Webhook URL 未正确配置，无法发送通知。');
        return;
    }

    try {
        const payload = {
            msg_type: 'text',
            content: {
                text: `${notificationTitle}\n${notificationBody}`,
            },
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseBody = await response.json();

        if (
            response.ok &&
            (responseBody.StatusCode === 0 || responseBody.code === 0 || responseBody.ok === true)
        ) {
            console.log(`[飞书通知 💌] 成功发送至飞书。响应: ${JSON.stringify(responseBody)}`);
        } else {
            console.error(
                `[飞书通知 ⚠️] 发送失败或飞书API报错。HTTP状态: ${response.status}，飞书响应: ${JSON.stringify(responseBody)}`
            );
        }
    } catch (error: any) {
        console.error(`[飞书通知 🔥] 发送过程中发生网络错误或异常: ${error.message}`);
    }
}
