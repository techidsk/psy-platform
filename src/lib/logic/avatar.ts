/**
 * 用于获取用户头像相关的复用逻辑
 */

// TODO 重构
/**
 * 根据从数据库中获取的用户头像字符串链接，确定最终的头像链接
 * 注意：此函数仅用于浏览器端 <img src>，始终返回相对路径以避免 SSR 水合不匹配
 * @param avatarUrl 从数据库中获取的用户头像字符串链接
 * @param username 用户名。如果不传入，那么也将使用默认头像。@mention 规定默认用户名为'DEFAULTNAME#NOBODY?_',如果有用户真的取了这个这个名会出现这个问题。可考虑先预设占位。
 * @returns e.g `/api/photo/avatar?username=${username}&hasAvatar=${avatarUrl}`
 */
export function getAvatarUrl(avatarUrl: string, username: string = 'DEFAULTNAME#NOBODY?_'): string {
    // 使用默认头像
    if (avatarUrl === '' || avatarUrl === undefined || username == 'DEFAULTNAME') {
        return `/api/photo/avatar?username=${username}`;
    }

    // 不符合所有规定的，也使用默认头像
    return `/api/photo/avatar?username=DEFAULTNAME#NOBODY?_`;
}
