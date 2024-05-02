import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/add
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '请登录后，再添加实验', error: '未登录' }, { status: 401 });
    }

    try {
        await db.experiment.create({
            data: {
                ...data,
                creator: parseInt(currentUser.id),
            },
        });
        return NextResponse.json({ msg: '成功添加实验' });
    } catch (error) {
        logger.error('添加实验失败', error);
        return NextResponse.json({ msg: '添加实验失败' }, { status: 500 });
    }
}
