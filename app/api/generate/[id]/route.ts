// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { getGenerateResult } from '@/lib/generate';

/**
 * /api/generate/[id]
 * 获取生成结果
 *
 * @returns
 */
export async function GET(request: Request, context: { params: any }) {
    // 首先请求
    const response = await getGenerateResult(context.params.id);
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
            return NextResponse.json({ msg: '生成失败', status: 'error' }, { status: 500 });
        }
    }
}
