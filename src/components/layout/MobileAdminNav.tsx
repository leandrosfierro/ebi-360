"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    Shield,
    Mail,
    FileText,
    ChevronRight,
    Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface NavLink {
    href: string;
    label: string;
    icon: any;
}

interface MobileAdminNavProps {
    title: string;
    links: NavLink[];
    role?: string;
}

export function MobileAdminNav({ title, links, role }: MobileAdminNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const currentLink = links.find(link => pathname === link.href) || links[0];

    return (
        <div className="md:hidden">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 glass-panel border-b border-white/20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -ml-2 rounded-xl bg-primary/10 text-primary active:scale-95 transition-transform"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 leading-none mb-1">
                            {role || "Administración"}
                        </span>
                        <div className="flex items-center gap-1">
                            <h1 className="text-sm font-bold text-foreground">
                                {currentLink?.label || title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="relative h-6 w-24">
                    <Image
                        src="/logo-bs360.png"
                        alt="EBI 360"
                        fill
                        className="object-contain object-right logo-color-filter"
                    />
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-[280px] bg-mesh-gradient shadow-2xl transition-transform duration-300 ease-out transform",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full glass-panel border-r border-white/20">
                    <div className="p-8 flex items-center justify-between">
                        <div className="relative h-8 w-32">
                            <Image
                                src="/logo-bs360.png"
                                alt="Bienestar 360"
                                fill
                                className="object-contain object-left logo-color-filter"
                            />
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl bg-white/5 text-foreground/60 hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <div className="mb-4">
                            <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                                Navegación
                            </p>

                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-white/5 transition-all"
                            >
                                <Home className="h-5 w-5" />
                                <span>Volver al Home</span>
                            </Link>

                            <div className="my-4 h-px bg-white/10 mx-4" />

                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all mb-1",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "text-muted-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-primary")} />
                                            <span>{link.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <form action="/auth/signout" method="post">
                            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95">
                                <LogOut className="h-5 w-5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </div>
    );
}
