/**
 * 在本地开发环境下时将该变量设置为true，而后在下方 isLocalDev 中修改URL为目标url链接。
 */
const isLocalDev = false;

export function getUrl(url: string) {
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';

    if (isLocalDev) {
        //在本地开发时，修改该URL为目标url链接即可。
        return '';
    }

    if (isDev) {
        console.log('url is: ', process.env.NEXT_PUBLIC_BASE_URL + url);
        return process.env.NEXT_PUBLIC_BASE_URL + url;
    } else if (isProd) {
        console.log('Running in production mode, ', url);
        return url;
    } else {
        console.log('Unknown NODE_ENV:', process.env.NODE_ENV, url);
        return url;
    }
}
