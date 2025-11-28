import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-x-hidden">
                <div className="flex-1">
                    {children}
                </div>
            </main>
            {showNav && <BottomNav />}
        </div>
    );
}
