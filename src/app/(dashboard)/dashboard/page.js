import { PrismaClient } from '@prisma/client';

import './styles.css'
const prisma = new PrismaClient()
async function getUsers() {
    const posts = await prisma.psy_user.findMany();
    prisma.$disconnect()
    return posts;
}

/**预实验指导语 */
export default async function Dashboard() {
    const users = await getUsers()

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <div className='text-lg font-bold'>
                    实验列表
                </div>
                {
                    users.map(e => <pre key={e.id}>
                        {e.username}
                    </pre>)
                }
            </div>
        </div>
    )
}
