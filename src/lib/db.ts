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
