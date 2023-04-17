import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { siteConfig } from "@/config/site"

export const authOptions: NextAuthOptions = {
    secret: process.env.JWT_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const url = new URL('/api/auth/login', process.env.NEXT_PUBLIC_BASE_URL);
                const authResponse = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(credentials),
                })
                if (!authResponse.ok) {
                    // console.log(authResponse.status, await authResponse.json())
                    return null
                }
                const user = await authResponse.json()
                // console.log('real db user: ', user, typeof user)
                return user
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.role = token.role
                session.user.image = token.picture
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    name: user.username,
                    picture: user.avatar,
                    role: user.user_role
                }
            }
            // 超时判断
            return token
        },
    },
}