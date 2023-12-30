// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';

const crypto = require('crypto')

/**
 * /api/auth/register
 * @returns 
 */
export async function POST(request: Request) {
    // 判断用户输入用户名或者email
    const data = await request.json()
    const username = data['username']
    const inputPassword = data['password']

    console.log('POST: ', data)
    const user = await db.psy_user.findFirst({
        where: {
            username: username
        }
    })
    if (user) {
        const body = JSON.stringify({ 'msg': '用户名存在' })
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res
    }
    const { salt, hashedPassword }: any = await hash(inputPassword)

    await db.psy_user.create({
        data: {
            username: username,
            user_role: 'USER',
            nano_id: getId(),
            salt: salt,
            password: hashedPassword,
        }
    })

    return NextResponse.json({ 'msg': '注册成功' });
}


async function verify(password: string, salt: string, hash: string) {
    return new Promise((resolve, reject) => {
        const keyBuffer = Buffer.from(hash, 'hex')
        crypto.scrypt(password, salt, 24, (err: Error, derivedKey: string) => {
            if (err) reject(err);
            resolve(crypto.timingSafeEqual(keyBuffer, derivedKey))
        })
    })
}

function convertBigIntToString(obj: any) {
    for (let key in obj) {
        if (typeof obj[key] === "object") {
            obj[key] = convertBigIntToString(obj[key]);
        } else if (typeof obj[key] === "bigint") {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}

async function hash(password: string) {
    return new Promise((resolve, reject) => {
        // generate random 16 bytes long salt
        const salt = crypto.randomBytes(16).toString("hex")
        crypto.scrypt(password, salt, 24, (err: Error, derivedKey: any) => {
            if (err) reject(err);
            resolve({
                salt: salt,
                hashedPassword: derivedKey.toString('hex')
            })
        });
    })
}