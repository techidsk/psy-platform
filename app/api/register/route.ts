// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { promisify } from 'util';
import { db } from '@/lib/db';
import crypto from 'crypto';

interface HashResult {
    salt: string;
    hashedPassword: string;
}

interface UserGroup {
    id: number;
    group_user_num: number;
}

interface UserManager {
    id: number;
    manager_id: number;
    manager_count: number;
}

/**
 * /api/register
 * 用户注册
 *
 * @returns
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        // 判断是否有用户存在
        const user = await db.user.findFirst({
            where: {
                username: data['username'],
            },
        });
        if (user) {
            return NextResponse.json({ msg: '用户名已存在' }, { status: 409 });
        }

        // 默认头像
        // 此处代码保留。如果希望配置统一的默认头像，则将下方 isUseStandardAvatar参数改为true
        const setting = await db.platform_setting.findFirst();
        let defaultAvatar = setting?.default_image;
        // 2024-1-23
        // 目前对于默认头像采用访问 `/api/photo/avatar` 接口生成svg图像解决。
        const isUseStandardAvatar = false; // 如果希望使用数据库配置的默认头像，则将此项参数值改为 true
        if (!isUseStandardAvatar) {
            defaultAvatar = '';
        }

        // 默认所属管理助手
        const manager = await db.$queryRaw<UserManager[]>`
            SELECT u.id, u.manager_id, COUNT(m.id) as manager_count
            FROM user u
                    LEFT JOIN user m ON u.id = m.manager_id
            WHERE u.user_role = 'ASSISTANT'
            and u.state = 1
            GROUP BY u.id, u.manager_id
            ORDER BY manager_count, rand()
            limit 1 
        `;

        if (manager.length === 0) {
            return NextResponse.json({ msg: '未分配助教' }, { status: 400 });
        }
        const managerId = manager[0].id;

        const nanoId = nanoid(16);
        const { salt, hashedPassword }: HashResult = await hash(data.password);
        // 被试注册
        await db.user.create({
            data: {
                ...data,
                nano_id: nanoId,
                user_role: 'USER',
                password: hashedPassword,
                salt: salt,
                avatar: defaultAvatar,
                // user_group_id: userGroup[0].id,
                manager_id: managerId,
            },
        });
        return NextResponse.json({ msg: '注册成功' });
    } catch (error) {
        console.error('注册失败:', error);
        return NextResponse.json({ error: '注册过程中出现错误' }, { status: 500 });
    }
}

const scryptAsync = promisify(crypto.scrypt);
/**
 * 密码加密
 * @param {string} password
 * @returns
 */
async function hash(password: string): Promise<HashResult> {
    const salt = crypto.randomBytes(16).toString('hex');

    try {
        // 注意: scryptAsync 返回的是 Buffer，需要转换为 string
        const derivedKey: Buffer = (await scryptAsync(password, salt, 24)) as Buffer;
        return {
            salt: salt,
            hashedPassword: derivedKey.toString('hex'),
        };
    } catch (err) {
        // 抛出异常而不是返回它
        throw err;
    }
}
