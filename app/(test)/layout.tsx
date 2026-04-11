import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

interface TestLayoutProps {
    children: React.ReactNode;
}

export default async function TestLayout({ children }: TestLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-white">
            <div className="container grid gap-12 px-8">
                <main className="flex w-full flex-col overflow-hidden">{children}</main>
            </div>
        </div>
    );
}
