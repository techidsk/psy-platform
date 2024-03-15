'use client';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';

/**预实验输入测试 */
export default function GuestResultPage({ params: { id } }: { params: { id: string } }) {
    const router = useRouter();
    const content = `感谢您完成了这个测试。根据您的测试过程，我们已经为您生成了以下两种展示方案。这些方案将帮助您更好地了解自己的内心世界，同时也是为了帮助我们更好地了解人类心理。
    请注意，这个测试的目的是为了帮助您更好地了解自己的情感、想法和行为。因此，请认真地阅读和比较这两种展示方案，并选择您认为最符合您内心世界的那一种。我们相信，您的选择将对您的自我认知和成长产生积极的影响。
    如果您在选择方案的过程中遇到任何困难或疑问，请不要犹豫，随时向我们寻求帮助和支持。我们将非常乐意为您提供帮助，并希望您能从这个测试中获得实际的收益。`;

    return (
        <div className="bg-white">
            <CenteredHero title={'完成测验'} content={content}>
                <div className="flex justify-between w-full">
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push(`/guest/result/gallery/{id}`)}
                    >
                        <Icons.tv />
                        回顾实验
                    </button>
                </div>
            </CenteredHero>
        </div>
    );
}
