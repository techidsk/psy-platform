interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-white">
            <div className="container grid gap-12 px-8">
                <main className="flex w-full flex-col overflow-hidden">{children}</main>
            </div>
        </div>
    );
}
