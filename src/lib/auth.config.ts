import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config (no database imports).
 * Used by middleware for JWT verification only.
 */
export const authConfig: NextAuthConfig = {
    trustHost: true,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/',
    },
    providers: [], // providers are added in auth.ts (Node runtime only)
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.username = (token.name as string) || '';
                session.user.role = token.role as string;
                session.user.image = token.picture as string;
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
            return token;
        },
    },
};
