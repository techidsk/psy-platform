import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deflate } from 'zlib';
/**
 * GET | /api/photo 检查某图片是否存在在数据库中,获取图片目前统一交给/api/psy接口。根据其是否附带查询参数决定其行为。
 * 查询参数名目：
 * - hash 附带为由前端通过SHA-256方法计算的文件哈希值。如果指定该项，则说明该请求用于检查数据库中是否存在某图片。
 *        如果存在，返回请求状态码为200,并在结果中返回相应的查询URL；如果不存在，状态码为404。
 *
 *
 * e.g /api/photo?hash=e3d6444b2c81165233ed8275a96d8670bb0a7997a9bfd4a7267037472dcdfbd8 检查该图片是否存在
 *
 *
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // const user = await getCurrentUser();

    // if (!user) {
    //     return new NextResponse('not permitted user', { status: 401 });
    // }

    if (searchParams.has('hash')) {
        const targetHash = searchParams.get('hash');
        if (targetHash == undefined) {
            return new NextResponse('Illegal request', { status: 401 });
        }

        const existRecord = await db.resource_image.findUnique({
            where: {
                hash: targetHash,
            },
            select: {
                id: true,
            },
        });

        if (existRecord) {
            return new NextResponse(`psy://photo/hash/${targetHash}`, { status: 200 });
        }

        return new NextResponse('Resource not exist', {
            status: 404,
        });
    }

    return new NextResponse('Illegal request', { status: 401 });
}

/**
 * TODO 上传到OSS
 * POST | /api/photo 上传压缩后的图片资源至后端，默认使用gzip方法进行压缩。需要使用form-data附加数据上传。
 *
 * form-data 必备参数项：
 * - data 压缩后的数据，一般为Blob。
 * - compressedType 文件的压缩类型（目前一律为gzip）
 * - fileType 原先文件类型
 * - hash 原先文件hash值
 *
 * 如果上传成功，则在响应的body中有序列化的名为ref的、以psy协议规定的资源查询语句。
 *
 * e.g POST | /api/photo
 * ...
 *
 * Response:Code 200 ; Body: {ref:"`psy://photo/id/23"}
 *
 *
 * @param request
 * @returns
 */
export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const compressedData = formData.get('data');
    const compressedType = formData.get('compressedType');
    const fileType = formData.get('dataType');
    const hash = formData.get('hash');

    if (
        !(
            fileType &&
            compressedData &&
            compressedType &&
            typeof compressedData === 'object' &&
            'arrayBuffer' in compressedData
        )
    ) {
        return new NextResponse('Illegal request.', { status: 400 });
    }

    try {
        const resultData = new Uint8Array(await compressedData.arrayBuffer());

        // const resouceImageRecord = await db.resource_image.create({
        //     data: {
        //         file_data: resultData,
        //         file_type: fileType.toString(),
        //         hash: hash?.toString() || '',
        //     },
        // });

        // return new NextResponse(
        //     JSON.stringify({ ref: `psy://photo/id/${resouceImageRecord.id}` }),
        //     { status: 200 }
        // );
    } catch (error) {
        console.error('error occurs when try to store file to the database', error);
        return new NextResponse(
            `Error occurs when try to store file to the database,error is\n:${error}`,
            { status: 400 }
        );
    }
}
