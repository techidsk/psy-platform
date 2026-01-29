// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/project/test/[id]
 * 验证项目是否可以正常使用
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const projectId = parseInt(params.id);

    const projectGroups = await db.project_group.findMany({
        where: {
            project_id: projectId,
            state: 'AVAILABLE',
        },
    });

    if (!projectGroups || projectGroups.length === 0) {
        return NextResponse.json({ msg: '项目未设置项目分组，请配置后重试' }, { status: 404 });
    }

    return NextResponse.json({ msg: '项目正常' });
}
