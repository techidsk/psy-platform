'use client';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.title = '自由写作';
    }, []);

    return (
        <html lang="en" data-theme="light">
            <head></head>
            <SessionProvider>
                <body>
                    {children}
                    <Toaster />
                </body>
            </SessionProvider>
        </html>
    );
}
