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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-white/10 pb-safe pt-2 shadow-glass backdrop-blur-lg">
            <div className="mx-auto flex max-w-md items-center justify-around px-4 pb-2">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all",
                                isActive
                                    ? "text-white scale-110"
                                    : "text-white/60 hover:text-white/90"
                            )}
                        >
                            <div className={cn(
                                "rounded-full p-2 transition-all",
                                isActive && "bg-white/20"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
