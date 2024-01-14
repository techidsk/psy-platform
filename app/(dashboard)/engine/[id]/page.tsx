import { EngineAddForm } from '@/components/engine/engine-form';

import { db } from '@/lib/db';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';

/**
 * 获取对应的生成引擎
 * @param id
 */
async function getEngine(id: string) {
    const engine = await db.user.findFirst({
        where: { id: parseInt(id) },
    });

    if (!engine) {
        console.error('不存在对应的引擎');
        return null;
    }

    return engine;
}

export default async function EngineForm({ params: { id } }: any) {
    const engine = await getEngine(id);

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading={`${engine?.id ? '编辑用户' : '创建新用户'}`} />
                <EngineAddForm className="w-full px-2" engine={engine} engine_id={id} />
            </div>
        </div>
    );
}
