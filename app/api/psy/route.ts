import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PsyProtocol, PsyResouceName } from '@/lib/pys-protocol';
import { unzipSync } from 'zlib';
import { ta } from 'date-fns/locale';

async function getPhotoWithId(photoId: number) {
    const photo = await db.resource_image.findUnique({
        where: {
            id: photoId,
        },
    });
    return photo;
}

async function getPhotoWithHash(photoHash: string) {
    const photo = await db.resource_image.findFirst({
        where: {
            hash: photoHash,
        },
    });
    return photo;
}

async function fetchResource(psyObject: PsyProtocol) {
    const targetResouce = psyObject.resouceName;

    if (targetResouce == PsyResouceName.Photo) {
        const queryArr = psyObject.queryPathArr;
        if (queryArr == undefined) {
            return undefined;
        }

        const fstQuery = queryArr.shift();
        const fstQueryVal = queryArr.shift();
        if (fstQuery == undefined || fstQueryVal == undefined) {
            return undefined;
        }

        switch (fstQuery) {
            case 'id':
                try {
                    return await getPhotoWithId(parseInt(fstQueryVal));
                } catch (error) {
                    return undefined;
                }
            case 'hash':
                try {
                    return await getPhotoWithHash(fstQueryVal);
                } catch (err) {
                    return undefined;
                }
            default:
                return undefined;
        }
    }
}

/**
 * GET | /api/psy 根据psy协议获取相应文件资源。需要附带查询参数url。
 *
 * 如果请求的资源为图片，会在后端将资源解压后正确返回图片。
 *
 *
 * 查询参数名目
 * - url 形如'psy://resoucename/querypath'的查询url
 *
 * 响应参数规定：
 * - 401 非法请求,缺失必须参数
 * - 403 传入的url不符合规定
 * - 404 请求的资源不存在
 *
 * - 请求成功的响应头：
 * - content-compressed-type 用于前端获取数据解压后，正确地将原文件还原的格式
 * - content-type 一般为 gzip，说明数据按照gzip进行解压缩
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

    if (searchParams.has('url')) {
        const targetPsyString = searchParams.get('url');
        if (targetPsyString == undefined) {
            return new NextResponse('Illegal request', { status: 401 });
        }

        if (!PsyProtocol.isStringLegal(targetPsyString)) {
            return new NextResponse('Illegal PsyUrl', { status: 403 });
        }

        const result = await fetchResource(new PsyProtocol(targetPsyString));

        if (result?.file_type.includes('image')) {
            return new NextResponse(unzipSync(result.file_data), {
                headers: {
                    'Content-Type': result?.file_type,
                },
            });
        }

        const res =
            result == undefined
                ? new NextResponse('Resouce Fetch Fail', { status: 404 })
                : new NextResponse(result.file_data, {
                      headers: {
                          'Content-Compressed-Type': result?.file_type,
                          'Content-Type': 'gzip',
                      },
                      status: 200,
                  });

        return res;
    }

    return new NextResponse('Illegal request', { status: 401 });
}
