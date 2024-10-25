import { AGES_MAP, GENDER_MAP } from '@/common/user';
import { formatTime } from '@/lib/date';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import JSZip from 'jszip';
import { NextResponse } from 'next/server';

export async function getUserExperimentHistory(
    userExperimentNanoId: string,
    part: string,
    includeExperimentRecord: boolean = true,
    includeInputRecord: boolean = true
) {
    // 获取用户实验记录
    const userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentNanoId },
    });
    const { start_timestamp, finish_timestamp } = getTimeStamp(userExperiment);
    const totalTime =
        finish_timestamp - start_timestamp > 0
            ? formatTime(finish_timestamp - start_timestamp)
            : '项目未完成';

    let experiment = null;
    let project = null;
    let projectGroup = null;
    if (userExperiment?.experiment_id) {
        experiment = await db.experiment.findFirst({
            where: { id: parseInt(userExperiment.experiment_id) },
        });
    } else {
        logger.error(`没有找到对应的实验记录 ${userExperimentNanoId}`);
    }

    if (userExperiment?.project_group_id) {
        projectGroup = await db.project_group.findFirst({
            where: { id: userExperiment?.project_group_id },
        });
        if (projectGroup?.project_id) {
            project = await db.projects.findFirst({
                where: { id: projectGroup?.project_id },
            });
        }
    }

    let engine = null;
    if (userExperiment?.engine_id) {
        engine = await db.engine.findFirst({
            where: { id: userExperiment?.engine_id },
        });
    }

    // 用户信息
    const userId = userExperiment?.user_id as number;
    const user = await db.user.findFirst({
        where: { id: userId },
    });

    const response = await db.trail_logger.findMany({
        where: { experiment_id: userExperimentNanoId, part: parseInt(part) },
        select: {
            input: true,
            images: true,
            timestamp: true,
        },
    });
    if (response.length === 0) {
        return NextResponse.json({ msg: '没有写作内容记录' }, { status: 404 });
    }

    // 获取每次生成的图片以及时间提示词
    const trail = await db.trail.findMany({
        where: { user_experiment_id: userExperimentNanoId, part: parseInt(part) },
        select: {
            image_url: true,
            prompt: true,
            create_time: true,
            update_time: true,
        },
    });

    // 返回CSV文件
    let csvContentJi = '';
    if (includeExperimentRecord) {
        csvContentJi = generateJiCsv(
            user,
            project,
            projectGroup,
            experiment,
            totalTime,
            engine,
            trail
        );
    }
    let csvContentHu = '';
    if (includeInputRecord) {
        csvContentHu = generateHuCsv(response);
    }

    const zipFileContent = await generateZipFile(csvContentJi, csvContentHu);

    return new Response(zipFileContent, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="files.zip"`,
        },
    });
}

// Helper functions for CSV generation and file handling

function generateJiCsv(
    user: any,
    project: any,
    projectGroup: any,
    experiment: any,
    totalTime: any,
    engine: any,
    trail: any[]
): string {
    const imageNum = trail.filter((row) => row.image_url).length;

    const gender = GENDER_MAP[user?.gender || 2];
    const ages = AGES_MAP[user?.ages || 0];

    // 纪老师要求的CSV内容
    let csvString = '\uFEFF';

    // 首行内容
    csvString += `uniqueID,Projectname,Condition,Trial,gender,agegroup,qualtricsid,writingtime,totalimages,engine,writing content,images,generate time\n`;
    csvString += `${user?.nano_id},${project?.project_name},${projectGroup?.group_name},${experiment?.experiment_name},${gender},${ages},${user?.qualtrics},${totalTime},${imageNum},${engine?.engine_name}\n`; // 添加标题行

    const emptyColumns = new Array(10).fill('').join(',');
    trail.forEach((row) => {
        const input = (row.prompt as string) || '';
        const image = row.image_url as string;
        const generateTime =
            row.update_time && row.create_time
                ? Math.round(
                      (new Date(row.update_time).getTime() - new Date(row.create_time).getTime()) /
                          1000
                  )
                : 0;
        csvString += `${emptyColumns},${input},${image},${generateTime}\n`;
    });
    return csvString;
}

function generateHuCsv(response: any[]): string {
    // 胡老师要求的CSV内容
    let csvString = '\uFEFF';
    csvString += 'Input,Images,Timestamp\n'; // 添加标题行
    response.forEach((row) => {
        let input = (row.input as string) || '';
        let images = row.images as string[];

        // 转义引号并处理数据中的逗号和双引号
        const inputEscaped = `"${input.replace(/"/g, '""')}"`;
        const imagesEscaped = images.map((image) => image.replace(/"/g, '""')).join('|');
        const timestampEscaped = `"${row.timestamp}"`;

        // 使用转义后的数据构建CSV行
        csvString += `${inputEscaped},${imagesEscaped},${timestampEscaped}\n`;
    });
    return csvString;
}

async function generateZipFile(jiCsv: string, huCsv: string): Promise<Buffer> {
    const zip = new JSZip();
    if (jiCsv) {
        zip.file('ji.csv', jiCsv);
    }
    if (huCsv) {
        zip.file('hu.csv', huCsv);
    }
    return await zip.generateAsync({ type: 'nodebuffer' });
}

function getTimeStamp(userExperiment: any) {
    const start_timestamp = userExperiment?.start_time
        ? new Date(userExperiment?.start_time).getTime()
        : 0;
    const finish_timestamp = userExperiment?.finish_time
        ? new Date(userExperiment?.finish_time).getTime()
        : 0;
    return { start_timestamp: start_timestamp / 1000, finish_timestamp: finish_timestamp / 1000 };
}
