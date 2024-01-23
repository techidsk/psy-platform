/**
 * 用于获取用户信息的相关逻辑复用
 */
import { type user } from '@prisma/client';
import { db } from '../db';

/**
 * 根据传入用户Id获取用户相关信息。
 * 建议在server components中使用，通过传入props的形式将结果传给需要的子组件。
 * @param userId 用户Id
 * @returns
 */
export async function getUser(userId: string): user {
    const user = await db.user.findUnique({
        where: {
            id: parseInt(userId),
        },
        select: {
            username: true,
            email: true,
            tel: true,
            avatar: true,
            create_time: true,
            last_login_time: true,
            qualtrics: true,
        },
    });
    console.log('returned:', user);
    return user;
}
