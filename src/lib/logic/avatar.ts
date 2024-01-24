/**
 * 用于获取用户头像相关的复用逻辑
 */

import { getUrl } from '../url';

/**
 * 根据从数据库中获取的用户头像字符串链接，确定最终的头像链接
 * @param avatarUrl 从数据库中获取的用户头像字符串链接
 * @param username 用户名。如果不传入，那么也将使用默认头像。@mention 规定默认用户名为'DEFAULTNAME#NOBODY?_',如果有用户真的取了这个这个名会出现这个问题。可考虑先预设占位。
 * @returns
 */
export function getAvatarUrl(avatarUrl: string, username: string = 'DEFAULTNAME#NOBODY?_') {
    // 使用默认头像
    if (avatarUrl == '' || username == 'DEFAULTNAME') {
        return getUrl(`/api/photo/avatar?username=${username}`);
    }

    // 根据头像协议链接确认是外链还是使用用户自定义的头像（存放在数据库中）
    const imageProtocol = new URL(avatarUrl).protocol;
    if (imageProtocol == 'psy:') {
        return getUrl(`/api/photo/avatar?username=${username}&hasAvatar=${avatarUrl}`);
    }
    // 使用外链
    if (imageProtocol == 'https:') {
        return avatarUrl;
    }

    // 不符合所有规定的，也使用默认头像
    return getUrl(`/api/photo/avatar?username=DEFAULTNAME#NOBODY?_`);
}
