/**
 * 用于获取用户信息的相关逻辑复用
 */
import { type user } from '@prisma/client';
import { db } from '../db';

interface HeaderUserInfo {
    id: number;
    username: string | null;
    email: string | null;
    tel: string | null;
    avatar: string | null;
    create_time: Date | null;
    last_login_time: Date | null;
    qualtrics: string | null;
}

/**
 * 根据传入用户Id获取用户相关信息。
 * 建议在server components中使用，通过传入props的形式将结果传给需要的子组件。
 * @param userId 用户Id
 * @returns
 */
async function getUser(userId: string): Promise<HeaderUserInfo> {
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
            id: true,
        },
    });
    // console.log('returned:', user);
    if (!user) {
        throw new Error('用户不存在');
    }
    if (user.username === null) {
        throw new Error('用户名不存在');
    }
    return user;
}

export { getUser };
export type { HeaderUserInfo };
