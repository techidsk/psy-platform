// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/experiment/[id]/step
 * 获取实验
 *
 * @returns
 */
export async function GET(request: Request, context: { params: any }) {
    const experimentId = context.params.id;

    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: '请登录管理员账号后操作' }, { status: 401 });
    }

    const experimentSteps = await db.experiment_steps.findMany({
        where: {
            experiment_id: Number(experimentId),
        },
    });

    return NextResponse.json(experimentSteps);
}
