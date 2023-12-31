import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'

/**
 * /api/experiment/add
 * @returns 
 */
export async function POST(request: Request) {
    const data = await request.json()

    const currentUser = await getCurrentUser()

    if (currentUser) {
        await db.experiment.create({
            data: {
                experiment_name: data.name,
                description: data.description,
                nano_id: data.nano_id,
                creator: parseInt(currentUser.id)
            }
        })
    }
    return NextResponse.json({ msg: 'success' })
}