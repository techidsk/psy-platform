import { notFound } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import Header from '@/components/header';
import { getUser } from '@/lib/logic/user';

interface LayoutProps {
    children?: React.ReactNode;
}

export default async function ExperimentLayout({ children }: LayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        return notFound();
    }

    const dbUser = await getUser(user.id);

    return (
        <div className="mx-auto flex flex-col space-y-4 items-center bg-white">
            <header className="container sticky top-0 w-full bg-white">
                <Header user={dbUser} />
            </header>
            <div className="container grid gap-12 px-8">
                <main className="flex w-full flex-col overflow-hidden">{children}</main>
            </div>
        </div>
    );
}
