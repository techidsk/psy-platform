import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { analyzeExperimentIntent } from '@/lib/prompt-preprocess';
import { logger } from '@/lib/logger';

/**
 * POST /api/experiment/analyze-all
 * 批量为所有实验生成意图画像（仅 SUPERADMIN 可调用）
 *
 * 参数（可选）：
 * - force: true 时强制重新分析已有画像的实验
 */
export async function POST(request: Request) {
    // 支持两种认证方式：session 登录态 或 X-Admin-Secret header
    const adminSecret = request.headers.get('X-Admin-Secret');
    if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
        // secret token 认证通过
    } else {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'SUPERADMIN') {
            return NextResponse.json({ msg: '没有权限' }, { status: 403 });
        }
    }

    const body = await request.json().catch(() => ({}));
    const force = Boolean(body.force);

    const experiments = await db.experiment.findMany({
        select: {
            id: true,
            nano_id: true,
            experiment_name: true,
            description: true,
            intro: true,
            intent_profile: true,
        },
        orderBy: { id: 'asc' },
    });

    const results: { id: number; name: string | null; status: string; purpose?: string }[] = [];

    for (const exp of experiments) {
        if (!exp.nano_id) {
            results.push({ id: exp.id, name: exp.experiment_name, status: 'skipped_no_nano_id' });
            continue;
        }

        if (exp.intent_profile && !force) {
            const existing = JSON.parse(exp.intent_profile);
            results.push({
                id: exp.id,
                name: exp.experiment_name,
                status: 'skipped_exists',
                purpose: existing.purpose,
            });
            continue;
        }

        try {
            const steps = await db.experiment_steps.findMany({
                where: { experiment_id: exp.id },
                select: { title: true, content: true },
                orderBy: { order: 'asc' },
            });

            const intentProfile = await analyzeExperimentIntent({
                description: exp.description,
                intro: exp.intro,
                steps,
            });

            await db.experiment.update({
                where: { id: exp.id },
                data: { intent_profile: intentProfile },
            });

            const parsed = JSON.parse(intentProfile);
            results.push({
                id: exp.id,
                name: exp.experiment_name,
                status: 'success',
                purpose: parsed.purpose,
            });
            logger.info({ experimentId: exp.id }, `意图分析完成: ${parsed.purpose}`);
        } catch (err) {
            results.push({ id: exp.id, name: exp.experiment_name, status: `failed: ${err}` });
            logger.error({ experimentId: exp.id, error: String(err) }, '意图分析失败');
        }
    }

    const summary = {
        total: experiments.length,
        success: results.filter((r) => r.status === 'success').length,
        skipped: results.filter((r) => r.status.startsWith('skipped')).length,
        failed: results.filter((r) => r.status.startsWith('failed')).length,
    };

    return NextResponse.json({ summary, results });
}
