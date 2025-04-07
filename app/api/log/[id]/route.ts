import { logger } from '@/lib/logger';
import { getUserExperimentHistory } from '@/lib/user_experment_history';
import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/log/[id]
 * 记录获取实验记录
 *
 * @returns
 */
export async function GET(request: NextRequest, context: { params: any }) {
    try {
        // 记录日志
        const userExperimentNanoId = context.params.id;
        const searchParams = request.nextUrl.searchParams;
        const part = searchParams.get('part') as string;
        const includeExperimentRecord = searchParams.get('includeExperimentRecord') === 'true';
        const includeInputRecord = searchParams.get('includeInputRecord') === 'true';

        return await getUserExperimentHistory(
            userExperimentNanoId,
            part,
            includeExperimentRecord,
            includeInputRecord
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `获取实验记录失败 [ID: ${context.params.id}, Part: ${request.nextUrl.searchParams.get('part')}]: ${errorMessage}`
        );
        // Consider returning a more specific but safe message depending on the error type if possible
        return NextResponse.json(
            { msg: '获取实验记录失败，请稍后重试或联系管理员。' },
            { status: 500 }
        );
    }
}
