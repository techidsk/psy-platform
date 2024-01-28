// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/project/group/bind
 * 绑定项目和项目分组
 * @returns
 */
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const data = await request.json();

    try {
        // 已经绑定过的跳过
        // 取消绑定的删除
        // 新绑定的添加
        const selectIds = data.group_ids as number[];
        await db.project_group.updateMany({
            where: {
                id: { in: data.group_ids as number[] },
            },
            data: {
                project_id: data.project_id,
                state: 'AVAILABLE',
            },
        });

        const currentGroups = await db.project_group.findMany({
            where: { project_id: data.project_id },
            select: { id: true },
        });

        const currentGroupIds = new Set(currentGroups.map((group) => group.id)) as Set<number>;
        // 分析要执行的操作：添加、删除、更新
        const groupsToAdd = Array.from(selectIds).filter((id: number) => !currentGroupIds.has(id));
        const groupsToDelete = Array.from(currentGroupIds).filter(
            (id: number) => !selectIds.includes(id)
        );

        // 使用事务进行所有数据库操作
        await db.$transaction(async (prisma) => {
            if (groupsToAdd.length > 0) {
                await prisma.project_group.updateMany({
                    where: {
                        id: { in: groupsToAdd },
                    },
                    data: {
                        project_id: data.project_id,
                        state: 'AVAILABLE',
                    },
                });
            }

            if (groupsToDelete.length > 0) {
                await prisma.project_group.updateMany({
                    where: {
                        id: { in: groupsToDelete },
                    },
                    data: {
                        project_id: null,
                        state: 'UNASSIGNED',
                    },
                });
            }
        });
        return NextResponse.json({ msg: '添加成功' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: '添加失败' }, { status: 500 });
    }
}
