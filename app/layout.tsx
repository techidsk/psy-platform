'use client';
import { SessionProvider } from 'next-auth/react';
import './globals.css'
import { Toaster } from '@/components/ui/toaster';
// import { SessionProvider } from "next-auth/react"


export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <head></head>
      <SessionProvider>
        <body>
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  )
}