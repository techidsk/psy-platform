// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/engine/[id]
 * 获取引擎信息
 *
 * @returns
 */
export async function GET(request: Request, context: { params: any }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    // 判断是否有用户存在
    let engine;
    if (currentUser.role === 'ADMIN') {
        engine = await db.engine.findFirst({
            where: { id: parseInt(context.params.id) },
            select: {
                engine_name: true,
                engine_description: true,
                gpt_prompt: true,
            },
        });
    } else if (currentUser.role === 'SUPERADMIN') {
        engine = await db.engine.findFirst({
            where: { id: parseInt(context.params.id) },
            select: {
                engine_name: true,
                engine_description: true,
                gpt_prompt: true,
                gpt_settings: true,
                template: true,
            },
        });
        if (!engine) {
            return NextResponse.json({ msg: '引擎不存在' }, { status: 404 });
        }
        const templateJson = engine?.template;
        const templateJsonString = JSON.stringify(templateJson) || '';
        const template = JSON.parse(templateJsonString);

        engine = {
            ...engine,
            prompt: template?.prompt || '',
            negative_prompt: template?.negative_prompt || '',
        };
    }

    if (engine) {
        return NextResponse.json(engine);
    } else {
        return NextResponse.json({ msg: '引擎不存在' }, { status: 404 });
    }
}

/**
 * 删除引擎
 * @param request
 * @param context
 * @returns
 */
export async function DELETE(request: Request, context: { params: any }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        await db.engine.delete({
            where: { id: parseInt(context.params.id) },
        });

        return NextResponse.json({ msg: '已删除用户' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
