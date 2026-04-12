import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { analyzeAndSaveIntentProfile } from '@/lib/prompt-preprocess';

/**
 * POST /api/experiment/[id]/analyze
 * 重新生成实验意图画像（仅 SUPERADMIN 可调用）
 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const { id } = await context.params;

    try {
        await analyzeAndSaveIntentProfile(id);
        return NextResponse.json({ msg: '意图画像已重新生成' });
    } catch (err) {
        return NextResponse.json({ msg: '生成失败', error: String(err) }, { status: 500 });
    }
}
