import { PrismaClient } from '@/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

declare global {
    // eslint-disable-next-line no-var
    var cachedPrisma: PrismaClient;
}

function createClient() {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
    if (process.env.NODE_ENV === 'production') {
        if (!global.cachedPrisma) {
            global.cachedPrisma = createClient();
        }
        return global.cachedPrisma;
    } else {
        if (!global.cachedPrisma) {
            global.cachedPrisma = createClient();
        }
        return global.cachedPrisma;
    }
}

export const db = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        return getClient()[prop as keyof PrismaClient];
    },
});

/**
 * 构建动态 WHERE 子句，兼容 adapter-mariadb 驱动适配器。
 *
 * adapter-mariadb 下 Prisma.raw / Prisma.empty / Prisma.join 对 $queryRaw
 * 标签模板的处理有已知问题，会把本应内联的 SQL 片段变成 `?` 占位符。
 * 这里改用 $queryRawUnsafe + 手动参数数组的方式，确保：
 * - 用户输入通过 `?` 参数化防止 SQL 注入
 * - ORDER BY / LIMIT / OFFSET 等动态 SQL 直接拼入字符串（值来自白名单或 Number()）
 */
export class QueryBuilder {
    private parts: string[] = [];
    private params: unknown[] = [];

    where(sql: string, ...values: unknown[]): this {
        this.parts.push(sql);
        this.params.push(...values);
        return this;
    }

    build(): { sql: string; params: unknown[] } {
        const whereSql = this.parts.length > 0 ? this.parts.join(' AND ') : '1 = 1';
        return { sql: whereSql, params: this.params };
    }
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
