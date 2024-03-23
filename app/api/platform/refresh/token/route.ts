import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { customAlphabet } from 'nanoid';
import { NextResponse } from 'next/server';

/**
 * /api/platform/refresh/token
 * 刷新token
 */
export async function GET() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ msg: '请先登录' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const nanoid = customAlphabet('1234567890abcdef', 10);
    await db.platform_setting.update({
        where: { id: 1 },
        data: {
            access_key: nanoid(8),
            access_end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
