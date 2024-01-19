import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/experiment/add
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();

    const currentUser = await getCurrentUser();

    if (currentUser) {
        const steps: {
            step_name: string;
            title: string;
            step_content: string;
            step_image?: string;
            type: number;
        }[] = data.steps;

        delete data.steps;
        const experiment = await db.experiment.create({
            data: {
                ...data,
                creator: parseInt(currentUser.id),
            },
        });

        // TODO 添加实验步骤
        await db.experiment_steps.createMany({
            data: steps.map((step, index) => ({
                experiment_id: experiment.id,
                step_name: step.step_name,
                order: index + 1,
                type: step.type,
                title: step.title,
                content: {
                    content: step.step_content,
                    image: step.step_image || '',
                },
            })),
        });
    }
    return NextResponse.json({ msg: 'success' });
}
