/**
 * 生成默认用户头像的工具函数。
 * 可把与用户头像相关的函数放在这里
 */

type SVGString = String;

/**
 * 获取默认头像，为一张纯色背景正中为用户名首字母的图像。以SVG图像的形式返回
 * @param username 用户名
 * @returns svg字符串
 */
export function getDefaultAvatar(username: string): SVGString {
    const fstCharacter = username.at(0);

    const hashToColor = (str: string) => {
        const mappingTable = {
            0: '#FFC0CB', // 粉红色
            1: '#ADD8E6', // 淡蓝色
            2: '#90EE90', // 淡绿色
            3: '#FFD700', // 金色
            4: '#FFA07A', // 浅鲑色
            5: '#9370DB', // 紫罗兰色
            6: '#00FA9A', // 薄荷绿
            7: '#FF6347', // 番茄红
            8: '#00CED1', // 深天蓝
            9: '#FF69B4', // 石榴红
        };
        let sum: number = 0;
        for (let i = 0; i < str.length; i++) {
            sum += str.charCodeAt(i);
        }
        return mappingTable[`${sum % 10}`];
    };

    const template = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${hashToColor(username)}" />
            <text x="50%" y="50%" fill="#FFFFFF" font-size="90" text-anchor="middle" dy=".3em">
                ${fstCharacter}
            </text>
        </svg>
    `;

    return template;
}
