// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db, convertBigIntToString } from '@/lib/db'

/**
 * /api/experiment/log
 * 获取用户实验记录详情
 * @returns 
 */
export async function POST(request: Request) {
    const data = await request.json()
    const infomations = await db.psy_user_experiments.findFirst({
        where: {
            nano_id: data.nano_id
        }
    })
    if (!infomations) {
        return NextResponse.json({});
    }
    let r = convertBigIntToString(infomations)
    return NextResponse.json(r);
}
