import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

function checkAuthPage(pathname: string) {
    return ['/login', '/register', '/guest'].some((path) => pathname.startsWith(path));
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

        return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/experiment/:path*', '/login', '/register'],
};
