import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { promisify } from 'util';
import { db } from './db';
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
                console.log('用户登录: ', credentials);
                const username = credentials['username'];
                const inputPassword = credentials['password'];
                let dbUser = await db.user.findFirst({
                    where: {
                        username: username,
                    },
                });
                if (!dbUser) {
                    console.error(`用户${username}不存在`);
                    return null;
                }
                const password = dbUser['password'] || '';
                const salt = dbUser['salt'] || '';
                const r = await verify(inputPassword, salt, password);
                if (!r) {
                    console.error(`用户${username}密码错误`);
                    return null;
                }
                return convertBigIntToString(dbUser);
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // console.log('--- session ----');
            // console.log(session, token);

            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        },
        async jwt({ token, user }) {
            // console.log('--- jwt ----');
            // console.log(token, user);

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
