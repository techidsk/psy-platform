'use client';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    console.log('RootLayout');
    return (
        <html lang="en">
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
