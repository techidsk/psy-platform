import { DashboardHeader } from '@/components/dashboard-header'
import './styles.css'
import Link from 'next/link'

/**预实验指导语 */
export default async function Dashboard() {

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="控制台" text="用户相关操作页面" />
                <div className='p-2'>
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <div className='flex flex-col gap-6'>
                                    <h1 className="text-5xl font-bold mb-4">实验名称</h1>
                                    <div className='flex flex-col'>
                                        <p className="py-2 text-justify">
                                            欢迎参加我们的心理学实验！该实验旨在探究人类的思维、行为和情感等方面，并为我们提供更深入的了解和认识。您的参与非常重要，我们非常感谢您抽出时间参与这项研究。</p>
                                        <p className="py-2 text-justify">
                                            在实验中，您将会接受一些任务和测试，如完成问卷、观看图像、听取音频等。请放心，所有测试都是匿名的，并且您的个人信息将被保密处理。我们将尽一切努力保证实验的安全性和可靠性。
                                        </p>
                                        <p className="py-2 text-justify">
                                            在参与实验过程中，如果您有任何疑问或需要帮助，请随时联系实验员。我们将竭尽全力为您提供支持和解答。
                                        </p>
                                        <p className="py-2 text-justify">
                                            最后，再次感谢您的参与。您的贡献将会对我们的研究产生重要的影响，帮助我们更好地理解和探索人类思维和行为。
                                        </p>
                                    </div>
                                    <Link href='/test'>
                                        <button className="btn btn-primary">开始测验</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
