// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { promisify } from 'util';
import crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * /api/auth/login
 * 用户登录
 *
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const username = data['username'];
    const inputPassword = data['password'];
    const user = await db.user.findFirst({
        where: {
            username: username,
        },
    });

    if (!user) {
        return NextResponse.json({ msg: '用户名或者密码错误' }, { status: 401 });
    }

    // 验证密码是否一致
    const password = user['password'] || '';
    const salt = user['salt'] || '';
    const r = await verify(inputPassword, salt, password);
    if (!r) {
        return NextResponse.json({ msg: '用户名或者密码错误' }, { status: 401 });
    }

    // 更新用户最后登录时间
    await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            last_login_time: new Date(),
        },
    });

    await db.user_login_log.create({
        data: {
            user_id: user.id,
            login_time: new Date(),
        },
    });

    return NextResponse.json(user);
}

const scryptAsync = promisify(crypto.scrypt);

async function verify(password: string, salt: string, hash: string): Promise<boolean> {
    try {
        const keyBuffer = Buffer.from(hash, 'hex');
        const derivedKey = (await scryptAsync(password, salt, 24)) as Buffer;
        return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (err) {
        // 适当地处理错误
        throw err;
    }
}
