// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const crypto = require('crypto')

const prisma = new PrismaClient()
/**
 * /api/auth/login
 * @returns 
 */
export async function POST(request) {
    console.log('api/auth/login');

    // 判断用户输入用户名或者email
    const data = await request.json()
    const username = data['username']
    const inputPassword = data['password']
    const user = await prisma.psy_user.findFirst({
        where: {
            username: username
        }
    })
    if (!user) {
        const body = JSON.stringify({ 'msg': '用户名或者密码错误' })
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.error(`用户${username}不存在`);
        prisma.$disconnect()
        return res
    }

    const password = user['password'] || ''
    const salt = user['salt'] || ''
    const r = await verify(inputPassword, salt, password)
    if (!r) {
        const body = JSON.stringify({ 'msg': '用户名或者密码错误' })
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.error(`用户${username}密码错误`);
        prisma.$disconnect()
        return res
    }
    prisma.$disconnect()
    convertBigIntToString(user)
    return NextResponse.json(user);
}


async function verify(password, salt, hash) {
    return new Promise((resolve, reject) => {
        const keyBuffer = Buffer.from(hash, 'hex')
        crypto.scrypt(password, salt, 24, (err, derivedKey) => {
            if (err) reject(err);
            resolve(crypto.timingSafeEqual(keyBuffer, derivedKey))
        })
    })
}

function convertBigIntToString(obj) {
    for (let key in obj) {
        if (typeof obj[key] === "object") {
            obj[key] = convertBigIntToString(obj[key]);
        } else if (typeof obj[key] === "bigint") {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}