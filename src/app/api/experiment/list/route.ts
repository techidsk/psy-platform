// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db, convertBigIntToString } from '@/lib/db'

/**
 * /api/experiment/list
 * @returns 
 */
export async function POST(request: Request) {
    const data = await request.json()
    console.log(data)
    const experiments = await db.psy_experiment.findMany({
        where: {
            creator: BigInt(data.user_id)
        }
    })
    console.log('experiments : ', experiments)
    // if (!experiments) {
    //     return NextResponse.json([]);
    // }
    // console.log(experiments);

    let r = experiments.map(e => (convertBigIntToString(e)))
    return NextResponse.json(r);
}
