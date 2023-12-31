import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/experiment/steps
 * 获取用户实验列表
 *
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const steps = await db.experiment_steps.findMany({
        where: {
            experiment_id: data.experiment_id,
        },
        orderBy: [{ order: 'asc' }],
    });
    return NextResponse.json(steps);
}
