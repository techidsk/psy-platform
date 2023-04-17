import { PlayIcon, TrashIcon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'
import Image from 'next/image';

const BASE_URL = 'http://localhost:3000'

async function getUsers() {
    const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/user/list?', { cache: 'no-store' })
    if (!r.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }
    return r.json();
}
async function getExperiments(id) {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/experiment?id=2')
    return res.json();
}


export default async function User() {
    // const users = await getUsers();
    // // const users = []
    // const experiment = await getExperiments(2);
    const usersD = getUsers();
    const experimentD = getExperiments(2);

    const [users, experiment] = await Promise.all([usersD, experimentD]);

    console.log('users: ', users, experiment, process.env.NEXT_PUBLIC_BASE_URL)

    return (
        <div className="overflow-x-auto">
            <>
                <h1>{experiment.id}</h1>
                <h1>{experiment.title}</h1>
            </>

            <table className="table w-full">
                <thead>
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                        >
                            用户名
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            创建时间
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Email
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            状态
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            资讯
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map(e => {
                            return <tr key={e.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className='flex gap-4 items-center '>
                                        <Image
                                            src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                                            alt=''
                                            height={48}
                                            width={48}
                                            className='rounded-full'
                                        />
                                        <div className='flex flex-col gap-2'>
                                            <span>
                                                {e.username}
                                            </span>
                                            <span>
                                                {`${e.email}`}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    <div className='flex flex-col gap-2 '>
                                        <span>
                                            {e.create_time}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ecpknymt@gmail.com
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded bg-red-100 text-red-800">
                                        {e.user_role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    我左手拿枪，右手开天，问天下谁是对手。
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className='flex gap-4 items-center '>
                                        <PlayIcon height={24} width={24} />
                                        <TrashIcon height={24} width={24} />
                                        <PaperPlaneIcon height={20} width={20} />
                                    </div>
                                </td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}