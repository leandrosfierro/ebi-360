"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Shield,
    Mail,
    ClipboardCheck,
    BookOpen,
    Settings,
    Users,
    Activity,
    TrendingUp,
    FileText,
    User,
    Home
} from "lucide-react";

// Register icons here
const IconMap: Record<string, any> = {
    LayoutDashboard,
    Building2,
    Shield,
    Mail,
    ClipboardCheck,
    BookOpen,
    Settings,
    Users,
    Activity,
    TrendingUp,
    FileText,
    User,
    Home
};

interface AdminSidebarLinksProps {
    links: {
        href: string;
        label: string;
        icon: string;
    }[];
    primaryColor?: string | null;
}

export function AdminSidebarLinks({ links, primaryColor }: AdminSidebarLinksProps) {
    const pathname = usePathname();

    return (
        <>
            {links.map((link) => {
                const Icon = IconMap[link.icon] || LayoutDashboard;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all mb-1",
                            isActive
                                ? "text-white shadow-lg scale-[1.02]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-primary font-medium"
                        )}
                        style={isActive ? {
                            backgroundColor: primaryColor || 'var(--primary)',
                            boxShadow: primaryColor ? `0 10px 15px -3px ${primaryColor}40` : undefined
                        } : {}}
                    >
                        <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-primary/60")} style={!isActive && primaryColor ? { color: `${primaryColor}99` } : {}} />
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </>
    );
}
