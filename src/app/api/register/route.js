// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid'

const crypto = require('crypto')

const prisma = new PrismaClient()

/**
 * /api/register
 * @returns 
 */
export async function POST(request) {
    const data = await request.json()
    data['nano_id'] = nanoid(16)
    data['user_role'] = 'USER'
    let old_password = data['password']
    const { salt, hashedPassword } = await hash(old_password)
    data['salt'] = salt
    data['password'] = hashedPassword
    await prisma.psy_user.create({
        data: data
    })
    
    prisma.$disconnect()
    return NextResponse.json({ 'msg': 'success' });
}

async function hash(password) {
    return new Promise((resolve, reject) => {
        // generate random 16 bytes long salt
        const salt = crypto.randomBytes(16).toString("hex")
        crypto.scrypt(password, salt, 24, (err, derivedKey) => {
            if (err) reject(err);
            resolve({
                salt: salt,
                hashedPassword: derivedKey.toString('hex')
            })
        });
    })
}