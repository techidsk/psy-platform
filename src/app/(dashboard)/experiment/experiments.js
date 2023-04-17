// 实验列表
import Image from 'next/image';
import Link from 'next/link';

const BASE_URL = 'http://localhost:3000'
function getExperiments() {
    // const result = []
    // Array.from([1, 2, 3]).forEach(element => {
    //     let obj = {
    //         id: element,
    //         title: '社交媒体使用与孤独感：一项纵向研究',
    //         image: 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
    //     }
    //     result.push(obj)
    // });
    // await new Promise(resolve => setTimeout(resolve, 1000));
    return 1;
    return result
}



export default function Experiments({ expreiments }) {
    // let expreiments = await getExperiments()
    console.log(expreiments)

    return <div className='lists'>
        {expreiments.count}
        {
            // expreiments.map(e => (
            //     <div className='lists-item' key={e.id}>
            //         <div className='flex gap-8 text-sm items-center'>
            //             <Image
            //                 src={e.image}
            //                 width='72'
            //                 height='72'
            //                 alt=''
            //             />
            //             <div className='text-gray-600 font-bold'>
            //                 {e.title}
            //             </div>
            //         </div>
            //         <div className='flex gap-4 items-center'>
            //             <Link href='./experiment/intro'>
            //                 <div className='py-2 px-4 text-white text-sm rounded bg-blue-500 cursor-pointer'>
            //                     开始测验
            //                 </div>
            //             </Link>
            //         </div>
            //     </div>
            // ))
        }
    </div>
}