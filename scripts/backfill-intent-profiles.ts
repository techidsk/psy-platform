/**
 * 批量为所有实验生成意图画像（一次性脚本）
 *
 * 用法：npx tsx scripts/backfill-intent-profiles.ts
 */
import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local', override: true });

import { db } from '../src/lib/db';
import { analyzeExperimentIntent } from '../src/lib/prompt-preprocess';

async function main() {
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

    console.log(`共找到 ${experiments.length} 个实验\n`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const exp of experiments) {
        const label = `[${exp.id}] ${exp.experiment_name || '(无名称)'}`;

        // 已有 intent_profile 的跳过（如需强制重新分析，注释掉这段）
        if (exp.intent_profile) {
            console.log(`${label} — 已有画像，跳过`);
            skipped++;
            continue;
        }

        if (!exp.nano_id) {
            console.log(`${label} — 无 nano_id，跳过`);
            skipped++;
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
            console.log(`${label} — 完成: ${parsed.purpose}`);
            success++;
        } catch (err) {
            console.error(`${label} — 失败: ${err}`);
            failed++;
        }

        // 请求间隔，避免 API 限流
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`\n完成！成功: ${success}, 跳过: ${skipped}, 失败: ${failed}`);
    process.exit(0);
}

main().catch((err) => {
    console.error('脚本执行失败:', err);
    process.exit(1);
});
