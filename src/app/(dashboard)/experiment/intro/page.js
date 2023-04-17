"use client"
import Header from '@/components/header'
import Link from 'next/link';


/**预实验指导语 */
export default function Intro() {
    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <div className='text-xl text-justify mb-16 flex flex-col gap-8'>
                    <p>
                        尊敬的参与者，感谢您参加我们的研究。我们正在进行一项关于心理学的研究，旨在探索某些行为、想法和情感的特征。我们希望了解这些特征如何影响个体的行为和情感反应。
                    </p>
                    <p>
                        在本次研究中，您将被要求完成一些任务和问卷调查。这些任务和问卷调查将涉及到您的思考、感受和行为。我们想强调，您的参与是完全自愿的，您可以随时选择退出研究。您的个人信息和数据将被严格保密，只有研究团队成员才能访问它们。
                    </p>
                    <p>
                        请注意，本次研究的目的是为了帮助我们更好地了解心理学，从而改善人们的生活。我们希望您能尽可能地认真完成任务和问卷调查。如果您有任何疑问或意见，请随时与我们联系。我们将非常感激您的参与，谢谢！
                    </p>
                </div>
                <div className='flex flex-row-reverse'>
                    <Link href='./experiment/pre-style'>
                        <button className='btn btn-primary'>继续</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
