import { DefaultSession } from 'next-auth';

type UserId = string;

declare module 'next-auth' {
    interface Session {
        user: {
            id: UserId;
            username: string;
            role: string;
        } & DefaultSession['user'];
    }
    interface User {
        username: string;
        avatar: string;
        user_role: string;
    }
}
