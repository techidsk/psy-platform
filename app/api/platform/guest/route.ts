import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * /api/platform/guest
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
    const prevSetting = await db.platform_setting.findFirst({
        where: { id: 1 },
    });

    await db.platform_setting.update({
        where: { id: 1 },
        data: {
            guest_mode: !prevSetting?.guest_mode,
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
