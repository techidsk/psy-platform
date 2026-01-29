import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/user/privacy/[id]
 * 获取用户信息
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    // 判断是否有用户存在
    const user = await db.user.findFirst({
        where: { id: parseInt(id) },
        select: {
            qualtrics: true,
            ages: true,
            gender: true,
        },
    });
    if (user) {
        return NextResponse.json(user);
    } else {
        return NextResponse.json({ msg: '用户不存在' }, { status: 404 });
    }
}
