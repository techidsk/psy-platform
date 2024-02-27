/**
 * /api/photo/avatar 规范：
 *
 * GET | 获取用户头像。需要使用查询参数。该接口总是用于<Image>组件，因此有一些因为妥协而不合理的处理方式。
 *
 * 如果没有使用查询参数，则返回默认头像。
 *
 * 查询参数名目：
 * - username: 获取用户头像,参数值为用户名(username) //可能存在日后允许用户名重复而引发的问题
 * e.g /api/photo/avatar?username=wendaolee-dev
 *   · 附加参数
 *    附加参数指基于查询参数名目生效的参数。在代码中它只会在对应查询参数名目的逻辑中。e.g /api/photo/avatar?username=lee&hasAvatar=true hasAvatar只在处理username的相关逻辑中生效
 *    - hasAvatar 如果用户有自定义头像，启用该项。值为session中存储的avatar链接。将根据传入传入链接的协议("psy://") 返回图片。
 *                [psy://] 规定格式为 psy://sourcename/query_path e.g psy://avatar/wendaolee @todo 日后可考虑附加多级路径以供复杂查询，如查询历史头像  psy://avatar/wendaolee/history
 *
 * POST | 上传用户头像。需要使用form-data附加数据上传
 *
 * e.g POST | /api/photo/avatar
 *     Header - Content-type:multipart/form-data; boundary=<calculated when request is sent>
 *     Body - username:wendaolee <boundary> userid:233 <boundary> type:image/jpg <boundary> data:...
 *
 * form-data 必备参数项：
 * - username 更新的目标用户名
 * - userid 用户id
 * - type 附带的图像类型
 * - data 附带的图像文件数据
 */
import { type NextRequest, NextResponse } from 'next/server';
import { getDefaultAvatar } from '@/lib/avatars';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // const user = await getCurrentUser();

    // if (!user) {
    //     return new NextResponse('not permitted user', { status: 401 });
    // }

    if (searchParams.has('username')) {
        const targetUsername = searchParams.get('username');
        if (searchParams.has('hasAvatar')) {
            const hasAvatar = searchParams.get('hasAvatar');
            if (hasAvatar == '' || hasAvatar == null) {
                return new NextResponse('Illegal request.', { status: 400 });
            }
            const avatarUrl = new URL(hasAvatar);
            console.log(avatarUrl);

            // 如果是存放在服务端数据库的用户自定义头像，从数据库中读取对应图像并返回
            // 日后逻辑如果复杂起来将其放在一个函数中进行处理
            if (avatarUrl.protocol == 'psy:') {
                const targetResource = avatarUrl.hostname;
                const targetResourceUser = avatarUrl.pathname.split('/')[1];

                const avatarLatestResource = await db.user_avatar.findFirst({
                    where: {
                        username: targetResourceUser,
                    },
                    orderBy: {
                        version: 'desc',
                    },
                });
                console.log('target version number:', avatarLatestResource?.version);
                console.log(avatarLatestResource?.avatar_type, avatarLatestResource?.version);
                return new NextResponse(avatarLatestResource?.avatar, {
                    headers: {
                        'Content-Type': avatarLatestResource?.avatar_type || '',
                    },
                });
            }

            // 保留代码。如果链接是外链图像，则考虑获取外链图像后返回。
            // 需要考虑的是，该接口总是为<Image>组件调用，因此不能径直返回外链。
            // @mention 如果尝试获取图像再返回的话，事实上存在安全隐患
            if (avatarUrl.protocol == 'https:') {
                // const avatarResponse = await fetch(avatarUrl.href);
                // const resultData = avatarResponse;
                // return avatarResponse.status == 200
                //     ? new NextResponse()
                //     : new NextResponse(getDefaultAvatar(targetUsername), {
                //           headers: { 'Content-Type': 'image/svg+xml' },
                //       });
            }
        }
        return new NextResponse(getDefaultAvatar(targetUsername || ''), {
            headers: { 'Content-Type': 'image/svg+xml' },
        });
    }

    // 对于不符合规则的请求，一律返回默认头像
    return new NextResponse(getDefaultAvatar('Default'), {
        headers: { 'Content-Type': 'image/svg+xml' },
    });
}

/**
 * POST | 上传用户头像。需要使用form-data附加数据上传。
 *
 * form-data 必备参数项：
 * - username 更新的目标用户名
 * - userid 用户id
 * - type 附带的图像类型
 * - data 附带的图像文件数据
 *
 *
 * @param request
 * @returns
 */
export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const username = formData.get('username');
    const imagetype = formData.get('type');
    const file = formData.get('data');
    // const userid = parseInt(formData.get('userid'));

    // if (!(file && imagetype && username && userid)) {
    //     return new NextResponse('Illegal request.', { status: 401 });
    // }

    // const originAvatarData = await db.user_avatar.findFirst({
    //     where: {
    //         username: username,
    //     },
    //     select: {
    //         username: true,
    //         version: true,
    //         avatar: false,
    //     },
    //     orderBy: {
    //         version: 'desc',
    //     },
    // });

    /**
     * 存在可能日后允许重复用户名而引发的问题
     */
    // const userAvatarUrl = (
    //     await db.user.findFirst({
    //         where: {
    //             username: username,
    //         },
    //         select: {
    //             avatar: true,
    //         },
    //     })
    // )?.avatar;

    try {
        // @todo 接口的性能优化
        // if (originAvatarData == null) {
        const version = 1;
        // const fileData = new Uint8Array(await file.arrayBuffer());
        // const userAvatarRecord = await db.user_avatar.create({
        //     data: {
        //         username: username,
        //         version: version,
        //         avatar: fileData,
        //         avatar_type: imagetype,
        //     },
        // });

        // if (userAvatarUrl == '') {
        //     const result = await db.user.update({
        //         where: {
        //             username: username,
        //             id: userid,
        //         },
        //         data: {
        //             avatar: `psy://avatar/${username}`,
        //         },
        //     });
        // }

        // return new NextResponse('Success upload file', { status: 200 });
        // }

        // const version = originAvatarData.version + 1;
        // const fileData = new Uint8Array(await file.arrayBuffer());
        // const userAvatarRecord = await db.user_avatar.create({
        //     data: {
        //         username: username,
        //         version: version,
        //         avatar: fileData,
        //         avatar_type: imagetype,
        //     },
        //     select: {
        //         version: true,
        //     },
        // });
        // if (userAvatarUrl == '') {
        //     const result = await db.user.update({
        //         where: {
        //             username: username,
        //             id: userid,
        //         },
        //         data: {
        //             avatar: `psy://avatar/${username}`,
        //         },
        //     });
        // }
        return new NextResponse('Success upload file', { status: 200 });
    } catch (error) {
        console.error('error occurs when try to store file to the database', error);
        return new NextResponse(
            `Error occurs when try to store file to the database,error is\n:${error}`,
            { status: 400 }
        );
    }
}
