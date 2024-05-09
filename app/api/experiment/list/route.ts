// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';

/**
 * /api/experiment/list
 * 获取用户实验列表
 *
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const currentUser = await getCurrentUser();
    const role = currentUser?.role;
    // 如果是超级管理员(SUPER_ADMIN), 可以看到所有用户的测试结果
    // 如果是助理学生(ASSISTANT), 则可以看到自己名下管理的被试的测试结果
    // 如果是用户(USER)本身只能看到自己的测试结果
    const experiments = await db.experiment.findMany({
        where: {
            creator: data.user_id,
        },
    });
    return NextResponse.json(experiments);
}

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json('请重新登陆！', { status: 401 });
    }
    const role = currentUser?.role;
    // 如果是超级管理员(SUPER_ADMIN), 可以看到所有用户的测试结果
    // 如果是助理学生(ASSISTANT), 则可以看到自己名下管理的被试的测试结果
    // 如果是用户(USER)本身只能看到自己的测试结果
    const experiments = await db.experiment.findMany({
        where: {
            creator: parseInt(currentUser.id),
        },
    });
    return NextResponse.json(experiments);
}
