"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if scrolling up or at/near top
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide if scrolling down and not at top
            else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/", label: "Inicio", icon: Home },
        { href: "/diagnostico", label: "Diagnóstico", icon: Activity },
        { href: "/resultados", label: "Resultados", icon: BarChart2 },
        { href: "/perfil", label: "Perfil", icon: User },
    ];

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6 transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"
            )}
        >
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
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
