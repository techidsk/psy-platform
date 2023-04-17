import { User } from "next-auth"
import { JWT } from "next-auth/jwt"

type UserId = string

declare module "next-auth/jwt" {
    interface JWT {
        id: UserId,
        username: string,
        role: string,
    }
}

declare module "next-auth" {
    interface Session {
        user: User & {
            id: UserId,
            username: string,
            role: string,
        }
    }
    interface User {
        username: string,
        avatar: string,
        user_role: string
    }
}
