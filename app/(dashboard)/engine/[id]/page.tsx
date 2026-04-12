import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canEdit } from '@/lib/permissions';
import { EngineDetailView } from '@/components/engine/engine-detail-view';
import { logger } from '@/lib/logger';

async function getEngine(id: string) {
    const engine = await db.engine.findFirst({
        where: { id: parseInt(id) },
    });

    if (!engine) {
        logger.error('不存在对应的引擎');
        return null;
    }

    return engine;
}

export default async function EngineDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [engine, user] = await Promise.all([getEngine(id), getCurrentUser()]);

    if (!engine) {
        return <div className="container">引擎不存在</div>;
    }

    const canUserEdit = canEdit(user?.role);

    return <EngineDetailView canEdit={canUserEdit} engineId={engine.id} />;
}
