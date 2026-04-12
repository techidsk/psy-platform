import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/engine/[id]
 * 获取引擎信息
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const engine = await db.engine.findFirst({
        where: { id: parseInt(id) },
        select: {
            engine_name: true,
            engine_description: true,
            gpt_prompt: true,
        },
    });

    if (engine) {
        return NextResponse.json(engine);
    } else {
        return NextResponse.json({ msg: '引擎不存在' }, { status: 404 });
    }
}

/**
 * 删除引擎
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        await db.engine.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ msg: '已删除引擎' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
