const AVATAR_COLORS = [
    '#94A3B8', // 石板灰
    '#7DD3FC', // 天空蓝
    '#86EFAC', // 薄荷绿
    '#FDE68A', // 琥珀黄
    '#C4B5FD', // 薰衣草紫
    '#FDA4AF', // 玫瑰粉
    '#67E8F9', // 青碧
    '#A5B4FC', // 靛蓝
    '#6EE7B7', // 翡翠绿
    '#FBBF24', // 暖金
] as const;

function hashToColor(str: string): string {
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * 获取默认头像，纯色背景 + 用户名首字母的 SVG 图像
 */
export function getDefaultAvatar(username: string): string {
    const initial = username.at(0)?.toUpperCase() ?? '?';
    const bgColor = hashToColor(username);

    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" rx="100"/>
  <text x="50%" y="50%" fill="#FFF" font-size="90" font-weight="600" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="middle" dy=".35em">${initial}</text>
</svg>`;
}
