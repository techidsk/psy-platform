interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="mx-auto flex flex-col space-y-4 items-center bg-white">
            <div className="min-h-screen py-8">{children}</div>
        </div>
    );
}
