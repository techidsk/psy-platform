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
 *                [psy://] 规定格式为 psy://sourcename/query_path e.g psy://avatar/wendaolee
 *
 * POST | 上传用户头像
 */
import { type NextRequest, NextResponse } from 'next/server';
import { getDefaultAvatar } from '@/lib/avatars';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.has('username')) {
        const targetUsername = searchParams.get('username');
        if (searchParams.has('hasAvatar')) {
            const avatarUrl = new URL(searchParams.get('hasAvatar'));

            // 如果是存放在服务端数据库的用户自定义头像，从数据库中读取对应图像并返回
            if (avatarUrl.protocol == 'psy:') {
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
        return new NextResponse(getDefaultAvatar(targetUsername), {
            headers: { 'Content-Type': 'image/svg+xml' },
        });
    }

    // 对于不符合规则的请求，一律返回默认头像
    return new NextResponse(getDefaultAvatar('Default'), {
        headers: { 'Content-Type': 'image/svg+xml' },
    });
}

export async function POST(request: NextRequest) {}
