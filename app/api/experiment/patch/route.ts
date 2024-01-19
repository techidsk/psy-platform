// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/experiment/patch
 * 更新实验信息
 *
 * @returns
 */
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    try {
        const data = await request.json();
        if (!data.id) {
            return NextResponse.json({ msg: '实验 ID 不能为空' }, { status: 400 });
        }

        await db.experiment.update({
            where: { id: data['id'] },
            data: data,
        });
        // TODO 更新实验步骤
        const steps: {
            step_name: string;
            title: string;
            step_content: string;
            step_image?: string;
            type: number;
        }[] = data.steps;
        console.log(steps, data.id);

        return NextResponse.json({ msg: '添加成功' });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
