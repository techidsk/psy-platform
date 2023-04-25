export function getUrl(url: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log('url is: ', process.env.NEXT_PUBLIC_BASE_URL + url)
        return process.env.NEXT_PUBLIC_BASE_URL + url
    } else if (process.env.NODE_ENV === 'production') {
        console.log('Running in production mode, ', url);
        return url
    } else {
        console.log('Unknown NODE_ENV:', process.env.NODE_ENV, url);
        return url
    }
}