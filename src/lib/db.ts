import { PrismaClient } from "@prisma/client"

declare global {
    // eslint-disable-next-line no-var
    var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient()
} else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = new PrismaClient()
    }
    prisma = global.cachedPrisma
}

export const db = prisma

export function convertBigIntToString(obj: any) {
    for (let key in obj) {
        if (typeof obj[key] === "object") {
            obj[key] = convertBigIntToString(obj[key]);
        } else if (typeof obj[key] === "bigint") {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}