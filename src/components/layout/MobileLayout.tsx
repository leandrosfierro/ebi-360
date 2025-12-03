"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    // For admin routes, we want full width and no bottom nav
    const isFullWidth = isAdmin;
    const shouldShowNav = showNav && !isAdmin;

    return (
        <div className="flex min-h-screen flex-col">
            <main
                className={`flex flex-1 flex-col overflow-x-hidden ${isFullWidth ? "w-full min-w-full" : "mx-auto w-full max-w-md"
                    }`}
            >
                <div className="flex-1">
                    {children}
                </div>
            </main>
            {shouldShowNav && <BottomNav />}
        </div>
    );
}
