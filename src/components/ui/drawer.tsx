import { ReactNode } from 'react';

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string | ReactNode;
}

export function Drawer({ text, children }: DrawerProps) {
    return (
        <div className="drawer drawer-end">
            <input nano_id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
                    {text}
                </label>
            </div>
            <div className="drawer-side z-30">
                <label
                    htmlFor="my-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">{children}</div>
            </div>
        </div>
    );
}
