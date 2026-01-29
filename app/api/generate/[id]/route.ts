// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { getGenerateResult } from '@/lib/generate';
import { logger } from '@/lib/logger';

/**
 * /api/generate/[id]
 * 获取生成结果
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    // 检查ID是否为undefined
    if (!id || id === 'undefined') {
        logger.error(`无效的生成任务ID: ${id}`);
        return NextResponse.json(
            { msg: '生成失败，无效的任务ID', status: 'error' },
            { status: 400 }
        );
    }

    // 首先请求
    const response = await getGenerateResult(id);

    if (response) {
        const status = response.status;
        if (status === 'pending') {
            // 继续等待结果
            return NextResponse.json({ msg: '等待生成', status: 'pending' });
        } else if (status === 'completed') {
            // 生成成功
            return NextResponse.json({ msg: '生成成功', status: 'success', data: response.result });
        } else {
            // 生成失败
            logger.error(`生成失败，状态: ${status}, 消息: ${response.message || '无错误消息'}`);
            return NextResponse.json(
                {
                    msg: '生成失败',
                    status: 'error',
                    error: response.message,
                },
                { status: 500 }
            );
        }
    } else {
        // 添加处理response为null/undefined的情况
        logger.error(`生成请求失败，响应为空`);
        return NextResponse.json({ msg: '生成请求失败', status: 'error' }, { status: 500 });
    }
}
