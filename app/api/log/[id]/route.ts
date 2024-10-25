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
        logger.error(`更新失败:${error}`);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
