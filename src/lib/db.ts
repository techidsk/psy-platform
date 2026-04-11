import { Prisma, PrismaClient } from '@/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

declare global {
    // eslint-disable-next-line no-var
    var cachedPrisma: PrismaClient;
}

function createClient() {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    return new PrismaClient({ adapter });
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
    prisma = createClient();
} else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = createClient();
    }
    prisma = global.cachedPrisma;
}

export const db = prisma;

/**
 * 将多个 Prisma.Sql 条件用 AND 拼接，兼容 MariaDB 驱动适配器。
 * Prisma.join 在 adapter-mariadb 下对 Prisma.Sql 片段处理有问题，
 * 这里用 Prisma.sql 链式拼接保证参数正确传递。
 */
export function joinConditions(conditions: Prisma.Sql[]): Prisma.Sql {
    if (conditions.length === 0) return Prisma.sql`1 = 1`;
    let result = conditions[0];
    for (let i = 1; i < conditions.length; i++) {
        result = Prisma.sql`${result} AND ${conditions[i]}`;
    }
    return result;
}

export function convertBigIntToString(obj: any) {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = convertBigIntToString(obj[key]);
        } else if (typeof obj[key] === 'bigint') {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}
