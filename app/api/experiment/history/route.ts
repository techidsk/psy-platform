// 下载实验记录

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import downloadQueue from '@/lib/queue';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';
import processDownload from '@/lib/downloadProcessor';
import { readFile } from 'fs/promises';
import { unlink } from 'fs/promises';

// 在文件顶部添加这行
downloadQueue.process('process-download', processDownload);

// api/experiment/history
export async function POST(req: NextRequest) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role === 'GUEST') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams, includeExperimentRecord, includeInputRecord } = await req.json();
    const jobId = getId();

    // Add job to the queue
    await downloadQueue.add(
        'process-download',
        {
            searchParams,
            includeExperimentRecord,
            includeInputRecord,
            currentUser,
            jobId,
        },
        { jobId }
    );
    logger.info(`Job added to queue: ${jobId}`);
    return NextResponse.json({ jobId });
}

export async function GET(req: NextRequest) {
    const jobId = req.nextUrl.searchParams.get('jobId');
    logger.info(`Checking job status for Job ID: ${jobId}`);

    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = await downloadQueue.getJob(jobId);
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress();

    if (state === 'completed') {
        const result = job.returnvalue;
        logger.info(`Job ${jobId} completed. Preparing download...`);
        logger.info(result);

        if (result && result.tempFilePath && result.completed) {
            logger.info(`Job ${jobId} completed, Reading zip file from ${result.tempFilePath}`);

            try {
                const zipContent = await readFile(result.tempFilePath);

                // 删除临时文件
                await unlink(result.tempFilePath);

                return new NextResponse(zipContent, {
                    headers: {
                        'Content-Type': 'application/zip',
                        'Content-Disposition': 'attachment; filename=all_filtered_experiments.zip',
                    },
                });
            } catch (error) {
                logger.error(`Error reading zip file: ${error}`);
                return NextResponse.json({ error: 'Error reading zip file' }, { status: 500 });
            }
        } else {
            logger.error(`Job ${jobId} completed but no zip file path found`);
            return NextResponse.json({ error: 'No zip file available' }, { status: 500 });
        }
    } else if (state === 'failed') {
        const failedReason = job.failedReason || 'Unknown error';
        logger.error(`Job ${jobId} failed: ${failedReason}`);
        return NextResponse.json({ error: failedReason }, { status: 500 });
    }

    return NextResponse.json({
        status: state,
        progress,
    });
}

export async function DELETE(req: NextRequest) {
    const jobId = req.nextUrl.searchParams.get('jobId');
    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = await downloadQueue.getJob(jobId);
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 取消任务
    await job.remove();

    // 如果任务正在处理中，我们需要等待它完成当前的批处理
    if (await job.isActive()) {
        logger.info(`Job ${jobId} is active, waiting for it to finish current batch`);
        // 可以在这里添加一个超时机制，如果等待时间过长就强制终止
    }

    return NextResponse.json({ message: 'Job cancelled successfully' });
}
