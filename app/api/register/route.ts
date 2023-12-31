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
        // 获取用户分组
        const userGroup = await db.$queryRaw<UserGroup[]>`
            select g.id, count(u.id) as group_user_num
            from user_group g
            left join user u on u.user_group_id = g.id
            where g.state = 1
            group by g.id
            ORDER BY group_user_num ASC
        `;
        if (userGroup.length === 0) {
            return NextResponse.json({ msg: '用户组不存在' }, { status: 400 });
        }

        // 默认头像
        const setting = await db.platform_setting.findFirst();
        const defaultAvatar = setting?.default_image;

        const nanoId = nanoid(16);
        const { salt, hashedPassword }: HashResult = await hash(data.password);
        await db.user.create({
            data: {
                ...data,
                nano_id: nanoId,
                user_role: 'USER',
                password: hashedPassword,
                salt: salt,
                avatar: defaultAvatar,
                user_group_id: userGroup[0].id,
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
