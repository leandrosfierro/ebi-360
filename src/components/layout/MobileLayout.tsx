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
    const isDiagnostic = pathname?.startsWith("/diagnostico");
    const shouldShowNav = showNav && !isAdmin && !isDiagnostic;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex flex-1 flex-col overflow-x-hidden w-full max-w-md md:max-w-none mx-auto">
                <div className="flex-1 w-full">
                    {children}
                </div>
            </main>
            {shouldShowNav && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
