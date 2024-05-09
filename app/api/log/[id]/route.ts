import { AGES_MAP, GENDER_MAP } from '@/common/user';
import { formatTime } from '@/lib/date';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';
import { P } from 'pino';

/**
 * /api/log/[id]
 * 记录获取实验记录
 *
 * @returns
 */
export async function GET(request: NextRequest, context: { params: any }) {
    try {
        // 记录日志
        // ...
        const userExperimentNanoId = context.params.id;
        const searchParams = request.nextUrl.searchParams;
        const part = searchParams.get('part') as string;

        const userExperiment = await db.user_experiments.findFirst({
            where: { nano_id: userExperimentNanoId },
        });
        const start_timestamp = userExperiment?.start_time
            ? new Date(userExperiment?.start_time).getTime()
            : 0;
        const finish_timestamp = userExperiment?.finish_time
            ? new Date(userExperiment?.finish_time).getTime()
            : 0;
        const d = Math.floor((finish_timestamp - start_timestamp) / 1000);
        const totalTime = d > 0 ? formatTime(d) : '项目未完成';

        let experiment = null;
        let project = null;
        let projectGroup = null;

        if (!userExperiment?.experiment_id) {
            logger.error(`没有找到对应的实验记录 ${userExperimentNanoId}`);
            experiment = await db.experiment.findFirst({
                where: { id: parseInt(userExperiment?.experiment_id || '0') },
            });
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

        // 用户信息
        const userId = userExperiment?.user_id as number;
        const user = await db.user.findFirst({
            where: { id: userId },
        });

        const gender = GENDER_MAP[user?.gender || 2];
        const ages = AGES_MAP[user?.ages || 0];

        const response = await db.trail_logger.findMany({
            where: { experiment_id: userExperimentNanoId, part: parseInt(part) },
            select: {
                input: true,
                images: true,
                timestamp: true,
            },
        });

        const trail = await db.trail.findMany({
            where: { user_experiment_id: userExperimentNanoId, part: parseInt(part) },
            select: {
                image_url: true,
                prompt: true,
            },
        });

        const images = trail.filter((row) => row.image_url);

        if (response.length === 0) {
            return NextResponse.json({ msg: '没有记录' }, { status: 404 });
        }
        let csvContentJi = '\uFEFF';
        let csvContentHu = '\uFEFF';

        // 导出文件首行
        csvContentJi += `uniqueID,Projectname,Condition,Trial,gender,agegroup,qualtricsid,writingtime,totalimages,writing content,images\n`;
        csvContentJi += `${user?.nano_id},${project?.project_name},${projectGroup?.group_name},${experiment?.experiment_name},${gender},${ages},${user?.qualtrics},${totalTime},${images.length}\n`; // 添加标题行
        const emptyColumns = new Array(9).fill('').join(','); // 生成9个逗号分隔的空字符串
        trail.forEach((row) => {
            const input = (row.prompt as string) || '';
            const image = row.image_url as string;
            csvContentJi += `${emptyColumns},${input},${image}\n`;
        });

        csvContentHu += 'Input,Images,Timestamp\n'; // 添加标题行
        response.forEach((row) => {
            let input = (row.input as string) || '';
            let images = row.images as string[];

            // 转义引号并处理数据中的逗号和双引号
            const inputEscaped = `"${input.replace(/"/g, '""')}"`;
            const imagesEscaped = images.map((image) => image.replace(/"/g, '""')).join('|');
            const timestampEscaped = `"${row.timestamp}"`;

            // 使用转义后的数据构建CSV行
            csvContentHu += `${inputEscaped},${imagesEscaped},${timestampEscaped}\n`;
        });

        // 返回CSV文件
        const zip = new JSZip();
        zip.file('ji.csv', csvContentJi);
        zip.file('hu.csv', csvContentHu);
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        return new Response(content, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="files.zip"`,
            },
        });
    } catch (error) {
        logger.error(`更新失败:${error}`);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
