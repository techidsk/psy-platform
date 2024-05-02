// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';

/**
 * /api/experiment/copy
 * 复制实验包括实验步骤
 *
 * @returns
 */
export async function POST(request: Request) {
    const nanoId = getId();
    const data = await request.json();
    // 判断用户是否有输入内容
    const experiment = await db.experiment.findUnique({
        where: { id: data.id },
    });

    if (!experiment) {
        return NextResponse.json({ msg: '实验不存在' });
    }
    const { id, create_time, nano_id, engine_ids, ...rest } = experiment;
    const engineIds = engine_ids as number[];
    // 创建实验
    const newExperiment = await db.experiment.create({
        data: {
            ...rest,
            nano_id: nanoId,
            engine_ids: engineIds,
        },
    });
    // 复制步骤
    const steps = await db.experiment_steps.findMany({
        where: { experiment_id: data.id },
    });

    await db.experiment_steps.createMany({
        data: steps.map((step: any, index) => ({
            experiment_id: newExperiment.id,
            step_name: step.step_name,
            order: index + 1,
            type: step.type,
            title: step.title,
            content: step.content,
            random_id: getId(),
            nano_id: getId(),
        })),
    });

    return NextResponse.json({ msg: '已完成写作' });
}
