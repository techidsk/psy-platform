import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { logger } from './logger';
const crypto = require('crypto');

export const authOptions: NextAuthOptions = {
    secret: process.env.JWT_SECRET,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any) {
                // 在这里进行登录判断
                logger.debug('用户登录: ', credentials);
                const username = credentials['username'];
                const inputPassword = credentials['password'];
                let dbUser = await db.user.findFirst({
                    where: {
                        username: username,
                    },
                });
                if (!dbUser) {
                    logger.error(`用户${username}不存在`);
                    return null;
                }
                const password = dbUser['password'] || '';
                const salt = dbUser['salt'] || '';
                const r = await verify(inputPassword, salt, password);
                if (!r) {
                    logger.error(`用户${username}密码错误`);
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
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.name || '';
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    name: user.username,
                    picture: user.avatar,
                    role: user.user_role,
                };
            }
            // 超时判断
            return token;
        },
    },
};

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
