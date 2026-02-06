"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    FileText,
    Home
} from "lucide-react";
import { usePathname } from "next/navigation";
import { UserRoleSwitcher } from "@/components/UserRoleSwitcher";
import { MobileAdminNav } from "@/components/layout/MobileAdminNav";
import { AdminSidebarLinks } from "@/components/admin/AdminSidebarLinks";
import Image from "next/image";

interface CompanyAdminLayoutClientProps {
    children: React.ReactNode;
    userRoles: string[];
    activeRole: string;
    companyBranding?: {
        name: string;
        logo_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
    } | null;
}

export default function CompanyAdminLayoutClient({
    children,
    userRoles,
    activeRole,
    companyBranding
}: CompanyAdminLayoutClientProps) {
    const pathname = usePathname();

    const navLinks = [
        { href: "/admin/company", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/admin/company/employees", label: "Colaboradores", icon: "Users", roles: ['company_admin', 'super_admin', 'consultor_bs360', 'rrhh'] },
        { href: "/admin/company/areas", label: "Áreas", icon: "Building2", roles: ['company_admin', 'super_admin', 'consultor_bs360', 'rrhh'] },
        { href: "/admin/company/evaluations", label: "Evaluaciones", icon: "ClipboardCheck", roles: ['company_admin', 'super_admin', 'consultor_bs360', 'rrhh'] },
        { href: "/admin/company/emails", label: "Invitaciones", icon: "Mail", roles: ['company_admin', 'super_admin', 'consultor_bs360', 'rrhh'] },
        { href: "/admin/company/reports", label: "Reportes", icon: "FileText" },
        { href: "/admin/company/settings", label: "Configuración", icon: "Settings", roles: ['company_admin', 'super_admin', 'consultor_bs360'] },
        { href: "/wellbeing", label: "Mi Rueda", icon: "Activity" },
    ].filter(link => !link.roles || link.roles.includes(activeRole));

    return (
        <div className="flex min-h-screen bg-mesh-gradient text-foreground flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="w-72 glass-panel border-r border-border hidden md:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                        {companyBranding?.logo_url ? (
                            <img
                                src={companyBranding.logo_url}
                                alt={companyBranding.name}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <Image
                                src="/logo-bs360.png"
                                alt="Bienestar 360"
                                width={140}
                                height={40}
                                className="object-contain logo-color-filter"
                                priority
                            />
                        )}
                    </div>
                    {companyBranding?.name && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 line-clamp-1" style={{ color: companyBranding.primary_color || 'var(--primary)' }}>
                            {companyBranding.name}
                        </p>
                    )}
                    <UserRoleSwitcher
                        currentRole={activeRole}
                        availableRoles={userRoles}
                        primaryColor={companyBranding?.primary_color}
                        excludeSuperAdmin={true}
                    />
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                    <div className="mb-4">
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Menú Principal</p>
                        <Link href="/" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-primary transition-all">
                            <Home className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" style={{ color: companyBranding?.primary_color ? `${companyBranding.primary_color}99` : 'var(--muted-foreground)' }} />
                            <span>Volver al Home</span>
                        </Link>
                        <AdminSidebarLinks links={navLinks} primaryColor={companyBranding?.primary_color} />
                    </div>
                </nav>

                <div className="p-4 border-t border-border">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95">
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Nav */}
            <MobileAdminNav
                title="Empresa Panel"
                links={navLinks}
                role="Gestión Empresa"
            />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto h-screen">
                <div className="mx-auto max-w-7xl animate-fadeIn space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
