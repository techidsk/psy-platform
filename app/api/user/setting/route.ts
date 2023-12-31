import { getCurrentUser } from '@/lib/session';
// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
/**
 * /api/user/setting
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const engineId = data.engineId;
    const currentUser = await getCurrentUser();
    if (currentUser) {
        await db.user_setting.upsert({
            where: {
                user_id: parseInt(currentUser.id),
            },
            update: {
                engine_id: parseInt(engineId),
            },
            create: {
                user_id: parseInt(currentUser.id),
                engine_id: parseInt(engineId),
            },
        });
    }

    return NextResponse.json({
        msg: 'success',
    });
}
