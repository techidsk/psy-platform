// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const crypto = require('crypto');

interface HashResult {
    salt: string;
    hashedPassword: string;
}

/**
 * /api/user/patch
 * 更新用户信息
 *
 * @returns
 */
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        const data = await request.json();
        if (!data.id) {
            return NextResponse.json({ msg: '用户 ID 不能为空' }, { status: 400 });
        }

        if (data.password) {
            const { salt, hashedPassword } = await hash(data.password);
            data.salt = salt;
            data.password = hashedPassword;
        } else {
            delete data.password;
        }

        await db.user.update({
            where: { id: data['id'] },
            data: data,
        });

        return NextResponse.json({ msg: '添加成功' });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
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
