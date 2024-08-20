// 下载实验记录

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { Prisma } from '@prisma/client';
import JSZip from 'jszip';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role === 'GUEST') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = await req.json();
    const experiments = await getFilteredExperiments(searchParams, currentUser, currentUser.role);

    const zip = new JSZip();

    logger.info(`实验记录数量: ${experiments.length}`);

    await Promise.all(
        experiments.map(async (experiment) => {
            const { nano_id, qualtrics, experiment_name, part } = experiment;
            const filename =
                part !== 0
                    ? `[${experiment_name}]-${part}-${qualtrics}-${nano_id}.zip`
                    : `[${experiment_name}]-${qualtrics}-${nano_id}.zip`;

            const blob = await fetchZipFile(nano_id, part);
            if (blob) {
                zip.file(filename, blob, { binary: true });
            } else {
                console.error(`Could not add file ${filename} to zip`);
            }
        })
    );

    const zipContent = await zip.generateAsync({ type: 'blob' });

    return new NextResponse(zipContent, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename=all_filtered_experiments.zip',
        },
    });
}

const fetchZipFile = async (nano_id: string, part: number) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/log/${nano_id}?part=${part}`
        );
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error(`Failed to fetch or process the blob: ${error}`);
        return null; // Return null to indicate failure
    }
};

async function getFilteredExperiments(searchParams: any, currentUser: any, role: string) {
    const {
        username,
        qualtrics,
        engine_name,
        group_name,
        experiment_name,
        start_time,
        finish_time,
    } = searchParams;

    return await db.$queryRaw<any[]>`
        SELECT e.*, u.username, u.avatar, u.qualtrics, n.engine_name, n.engine_image, 
        eper.experiment_name, g.group_name, num, project_group_experiment_num, es.step_name
        FROM user_experiments e
        LEFT JOIN user u ON u.id = e.user_id
        LEFT JOIN experiment eper ON eper.id = e.experiment_id
        LEFT JOIN project_group g ON g.id = e.project_group_id
        LEFT JOIN engine n ON n.id = e.engine_id
        LEFT JOIN (
            SELECT count(id) as num, user_id, project_group_id 
            FROM user_experiments 
            GROUP BY user_id, project_group_id
            ) ue ON ue.user_id = u.id AND ue.project_group_id = g.id
        LEFT JOIN (
            SELECT count(id) as project_group_experiment_num, project_group_id
            FROM project_group_experiments
            GROUP BY project_group_id
        ) pge ON pge.project_group_id = e.project_group_id
        LEFT JOIN experiment_steps es ON es.experiment_id = e.experiment_id and es.order = e.part
        WHERE 1 = 1 
        ${role === 'USER' ? Prisma.sql`and e.user_id = ${currentUser.id}` : Prisma.empty}
        ${role === 'ASSITANT' ? Prisma.sql`and e.manager_id = ${currentUser.id}` : Prisma.empty}
        ${start_time ? Prisma.sql`and e.start_time >= ${start_time}` : Prisma.empty}
        ${finish_time ? Prisma.sql`and e.finish_time <= ${finish_time}` : Prisma.empty}
        ${username ? Prisma.sql`and u.username like ${`%${username}%`}` : Prisma.empty}
        ${qualtrics ? Prisma.sql`and u.qualtrics like ${`%${qualtrics}%`}` : Prisma.empty}
        ${engine_name ? Prisma.sql`and n.engine_name like ${`%${engine_name}%`}` : Prisma.empty}
        ${group_name ? Prisma.sql`and g.group_name like ${`%${group_name}%`}` : Prisma.empty}
        ${experiment_name ? Prisma.sql`and eper.experiment_name like ${`%${experiment_name}%`}` : Prisma.empty}
        ORDER BY e.id DESC
    `;
}
