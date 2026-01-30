'use client';
import { use } from 'react';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { logger } from '@/lib/logger';
import store from 'store2';

/**预实验输入测试 */
export default function GuestResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const content = `感谢您完成了这个测试。根据您的测试过程，我们已经为您生成了以下两种展示方案。这些方案将帮助您更好地了解自己的内心世界，同时也是为了帮助我们更好地了解人类心理。
    请注意，这个测试的目的是为了帮助您更好地了解自己的情感、想法和行为。因此，请认真地阅读和比较这两种展示方案，并选择您认为最符合您内心世界的那一种。我们相信，您的选择将对您的自我认知和成长产生积极的影响。
    如果您在选择方案的过程中遇到任何困难或疑问，请不要犹豫，随时向我们寻求帮助和支持。我们将非常乐意为您提供帮助，并希望您能从这个测试中获得实际的收益。`;

    const GUEST_UNIQUE_KEY = 'userUniqueKey';
    const itemStr = store.get(GUEST_UNIQUE_KEY);
    const item = JSON.parse(itemStr);
    const userUniqueKey = item.value;
    const needNewUniqueKey = userUniqueKey === null;
    if (needNewUniqueKey) {
        logger.error('未找到合法的用户唯一标识');
    }

    function copy() {
        userUniqueKey && navigator.clipboard.writeText(userUniqueKey);
    }

    return (
        <div className="bg-white">
            <CenteredHero title={'完成测验'} content={content}>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col space-y-4 text-center">
                        <h1 className="text-4xl font-semibold tracking-tight">
                            恭喜你完成本次实验
                        </h1>
                        <div className="text text-slate-500 dark:text-slate-400">
                            这是您本次实验的唯一ID{'  '}
                            <kbd className="kbd kbd-md">{userUniqueKey}</kbd>
                            <button className="btn btn-ghost btn-sm ml-2" onClick={copy}>
                                复制
                            </button>
                        </div>
                    </div>
                </div>
            </CenteredHero>
        </div>
    );
}
