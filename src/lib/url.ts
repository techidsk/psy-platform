export function getUrl(url: string) {
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';

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
