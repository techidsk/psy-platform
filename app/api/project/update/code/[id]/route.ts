// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { nanoid } from 'nanoid';
import { logger } from '@/lib/logger';

/**
 * /api/project/update/code/[id]
 * 更新项目的邀请码
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const newInviteCode = nanoid();

    try {
        await db.projects.update({
            where: { id: parseInt(id) },
            data: {
                invite_code: newInviteCode,
            },
        });
        return NextResponse.json({ msg: '更新成功' });
    } catch (error) {
        logger.error(`更新项目邀请码失败 : ${error}`);
        return NextResponse.json({ msg: '更新项目邀请码失败' }, { status: 500 });
    }
}
