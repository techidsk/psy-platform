'use client';
import { use } from 'react';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';

/**预实验输入测试 */
export default function ArticleResult({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="bg-white">
            <CenteredHero title={'回顾实验'} content={''}>
                <div className="flex gap-4 w-full justify-center py-4">
                    <div className="card w-96 bg-base-100 shadow-xl">
                        <figure>
                            <img
                                src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                                alt="Shoes"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title justify-center mb-4">画廊模式</h2>
                            <p>像是在逛博物馆一样查看您的实验记录</p>
                            <div className="card-actions justify-center">
                                <button className="btn btn-primary">进入画廊模式</button>
                            </div>
                        </div>
                    </div>

                    <div className="card w-96 bg-base-100 shadow-xl">
                        <figure>
                            <img
                                src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                                alt="Shoes"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title justify-center mb-4">故事模式</h2>
                            <p>像是在阅读一本在线读物一样阅读你的试验记录</p>
                            <div className="card-actions justify-center">
                                <button className="btn btn-primary">进入故事模式</button>
                            </div>
                        </div>
                    </div>
                </div>
            </CenteredHero>
        </div>
    );
}
