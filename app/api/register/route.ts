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

/**
 * /api/register
 * 用户注册
 *
 * @returns
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const nanoId = nanoid(16);
        const { salt, hashedPassword }: HashResult = await hash(data.password);
        await db.user.create({
            data: {
                ...data,
                nano_id: nanoId,
                user_role: 'USER',
                password: hashedPassword,
                salt: salt,
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
