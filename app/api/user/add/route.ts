// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { promisify } from 'util';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const crypto = require('crypto');

interface HashResult {
    salt: string;
    hashedPassword: string;
}

/**
 * /api/user/add
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
    if (!data['nano_id']) {
        data['nano_id'] = nanoid(16);
    }

    // 判断是否有用户存在
    const user = await db.user.findFirst({
        where: {
            username: data['username'],
        },
    });
    if (user) {
        return NextResponse.json({ msg: '用户名已存在' }, { status: 409 });
    }

    // 判断是否有邮箱存在
    if (data['email']) {
        const emailUser = await db.user.findFirst({
            where: {
                email: data['email'],
            },
        });
        if (emailUser) {
            return NextResponse.json({ msg: '邮箱已存在' }, { status: 400 });
        }
    }

    // 密码加密
    let old_password = data['password'];
    const { salt, hashedPassword } = await hash(old_password);
    data['salt'] = salt;
    data['password'] = hashedPassword;
    await db.user.create({
        data: {
            ...data,
            manager_id: parseInt(currentUser.id),
        },
    });

    return NextResponse.json({ msg: '添加成功' });
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
