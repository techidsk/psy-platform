import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server';

function checkAuthPage(url: NextURL) {
    return ['/login', '/register', '/guest'].some((path) => url.pathname.startsWith(path));
}

export default withAuth(
    async function middleware(req) {
        const token = await getToken({ req });
        const isAuth = !!token;
        console.log(req.nextUrl);
        const isAuthPage = checkAuthPage(req.nextUrl);

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }

            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }
    },
    {
        callbacks: {
            async authorized() {
                // This is a work-around for handling redirect ON auth pages.
                // We return true here so that the middleware function above
                // is always called.
                return true;
            },
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/experiment/:path*', '/login', '/register'],
};
