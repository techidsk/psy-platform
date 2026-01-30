import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

function checkAuthPage(pathname: string) {
    // 首页 '/' 需要精确匹配，其他页面使用前缀匹配
    if (pathname === '/') return true;
    return ['/register', '/guest'].some((path) => pathname.startsWith(path));
}

export default auth((req) => {
    const { nextUrl } = req;
    const isAuth = !!req.auth;
    const isAuthPage = checkAuthPage(nextUrl.pathname);

    if (isAuthPage) {
        if (isAuth) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    }

    if (!isAuth) {
        let from = nextUrl.pathname;
        if (nextUrl.search) {
            from += nextUrl.search;
        }

        return NextResponse.redirect(new URL(`/?from=${encodeURIComponent(from)}`, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/', '/dashboard/:path*', '/experiment/:path*', '/register'],
};
