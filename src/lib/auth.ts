import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import { logger } from './logger';
import { authConfig } from './auth.config';
const crypto = require('crypto');

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    secret: process.env.JWT_SECRET,
    logger: {
        error(error) {
            logger.error(error.message, error);
        },
        warn(code) {
            logger.warn(code);
        },
        debug(code) {
            logger.debug(code);
        },
    },
    providers: [
        Credentials({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // 在这里进行登录判断
                logger.debug('用户登录: ', credentials);
                const username = credentials['username'] as string;
                const inputPassword = credentials['password'] as string;
                let dbUser = await db.user.findFirst({
                    where: {
                        username: username,
                    },
                });
                if (!dbUser) {
                    logger.debug(`用户${username}不存在`);
                    return null;
                }
                const password = dbUser['password'] || '';
                const salt = dbUser['salt'] || '';
                const r = await verify(inputPassword, salt, password);
                if (!r) {
                    logger.debug(`用户${username}密码错误`);
                    return null;
                }
                // 更新用户最后登录时间
                await db.user.update({
                    where: { id: dbUser.id },
                    data: { last_login_time: new Date() },
                });
                return convertBigIntToString(dbUser);
            },
        }),
    ],
});

async function verify(password: string, salt: string, hash: string) {
    return new Promise((resolve, reject) => {
        const keyBuffer = Buffer.from(hash, 'hex');
        crypto.scrypt(password, salt, 24, (err: Error, derivedKey: string) => {
            if (err) reject(err);
            resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
        });
    });
}

function convertBigIntToString(obj: any) {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = convertBigIntToString(obj[key]);
        } else if (typeof obj[key] === 'bigint') {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}
