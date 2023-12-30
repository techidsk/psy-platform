// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/experiment/finish
 * @returns 
 */
export async function POST(request: Request) {
    const data = await request.json()
    console.log(data.id);

    await db.psy_user_experiments.update({
        where: {
            nano_id: data.id
        },
        data: {
            finish_time: new Date()
        }
    })

    return NextResponse.json({ 'msg': 'success' })
}