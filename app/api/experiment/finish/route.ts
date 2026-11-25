import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    const data = await request.json().catch(() => null);
    if (
        typeof data?.id !== 'string' ||
        !data.id.trim() ||
        !Number.isSafeInteger(data.part) ||
        data.part < 0
    ) {
        return NextResponse.json({ msg: '参与编号或步骤无效' }, { status: 400 });
    }

    const step = { nano_id: data.id, part: data.part };
    const readStep = () =>
        db.user_experiments.findUnique({
            where: { nano_id_part: step },
            select: { state: true },
        });
    const duplicate = () => NextResponse.json({ msg: '已完成写作', duplicate: true });
    const conflict = () => NextResponse.json({ msg: '当前步骤状态无法完成' }, { status: 409 });

    const participation = await readStep();
    if (!participation) return NextResponse.json({ msg: '未找到本次参与步骤' }, { status: 404 });
    if (participation.state === 'FINISHED') return duplicate();
    if (participation.state !== 'IN_EXPERIMENT') return conflict();

    const trail = await db.trail.findFirst({
        where: { user_experiment_id: data.id, part: data.part },
        select: { id: true },
    });
    if (!trail) return NextResponse.json({ msg: '当前步骤尚无写作记录' }, { status: 400 });

    const updated = await db.user_experiments.updateMany({
        where: { ...step, state: 'IN_EXPERIMENT' },
        data: { finish_time: new Date(), state: 'FINISHED' },
    });
    if (updated.count === 0)
        return (await readStep())?.state === 'FINISHED' ? duplicate() : conflict();
    return NextResponse.json({ msg: '已完成写作' });
}
