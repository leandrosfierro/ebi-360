"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Inicio", icon: Home },
        { href: "/diagnostico", label: "Diagnóstico", icon: Activity },
        { href: "/resultados", label: "Resultados", icon: BarChart2 },
        { href: "/perfil", label: "Perfil", icon: User },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
            <nav className="glass-nav rounded-full px-2 py-3 shadow-2xl flex items-center justify-around border border-white/20">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={label}
                            className={cn(
                                "relative flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300",
                                isActive
                                    ? "bg-foreground text-background shadow-lg scale-110 -translate-y-2"
                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                            {isActive && (
                                <span className="absolute -bottom-8 text-[10px] font-medium text-gray-500 animate-fadeIn opacity-0 transition-opacity duration-300">
                                    {/* Optional label if needed, currently hidden */}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
