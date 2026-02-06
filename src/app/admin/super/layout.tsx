import Link from "next/link";
import Image from "next/image";
import {
    Home,
    LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MobileAdminNav } from "@/components/layout/MobileAdminNav";
import { AdminSidebarLinks } from "@/components/admin/AdminSidebarLinks";
import { UserRoleSwitcher } from "@/components/UserRoleSwitcher";


export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    if (error || !user) {
        redirect("/login");
    }



    const { data: profile } = await supabase
        .from('profiles')
        .select('roles, active_role, role')
        .eq('id', user.id)
        .single();

    const userRoles = profile?.roles || (profile?.role ? [profile.role] : ['employee']);
    const activeRole = profile?.active_role || profile?.role || 'employee';

    const isMaster = isSuperAdminEmail(user.email || '');

    // 🛡️ SECURITY AUDIT: Hardened Role Protection
    // Master Admins (whitelisted) are always authorized to enter super_admin layouts.
    // Others must have super_admin as their active_role.
    const isAuthorized = isMaster || activeRole === 'super_admin';

    if (!isAuthorized) {
        console.warn(`[SuperAdminLayout] Access denied for user ${user.email} with active_role ${activeRole}`);
        redirect("/perfil");
    }

    const navLinks = [
        { href: "/admin/super", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/admin/super/companies", label: "Empresas", icon: "Building2" },
        { href: "/admin/super/admins", label: "Super Admins", icon: "Shield" },
        { href: "/admin/super/emails", label: "Emails", icon: "Mail" },
        { href: "/admin/super/surveys", label: "Encuestas", icon: "ClipboardCheck" },
        { href: "/admin/super/docs", label: "Documentación", icon: "BookOpen" },
        { href: "/admin/super/settings", label: "Configuración", icon: "Settings" },
        { href: "/wellbeing", label: "Mi Rueda", icon: "Activity" },
    ];

    return (
        <div className="flex min-h-screen bg-mesh-gradient text-foreground transition-colors duration-500 flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="w-72 glass-panel border-r border-border hidden md:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Image
                            src="/logo-bs360.png"
                            alt="Bienestar 360"
                            width={140}
                            height={40}
                            className="object-contain logo-color-filter"
                            priority
                        />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-6">Super Admin Panel</p>

                    <div className="mb-4">
                        <UserRoleSwitcher
                            currentRole={activeRole}
                            availableRoles={userRoles}
                        />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-4 overflow-y-auto no-scrollbar">
                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Principal</p>
                        <Link href="/" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-primary transition-all mb-1">
                            <Home className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                            <span>Volver al Home</span>
                        </Link>
                        <AdminSidebarLinks links={navLinks.slice(0, 1)} />
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Gestión</p>
                        <AdminSidebarLinks links={navLinks.slice(1, 4)} />
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Sistemas & Docs</p>
                        <AdminSidebarLinks links={navLinks.slice(4, 6)} />
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Configuración</p>
                        <AdminSidebarLinks links={navLinks.slice(6, 7)} />
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Personal</p>
                        <AdminSidebarLinks links={navLinks.slice(7)} />
                    </div>
                </nav>

                <div className="p-4 border-t border-border">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 group">
                            <div className="p-2 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                                <LogOut className="h-5 w-5" />
                            </div>
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Nav */}
            <MobileAdminNav
                title="Super Admin"
                links={navLinks}
                role="Super Administrador"
            />

            <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto no-scrollbar relative z-10 w-full min-w-0">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
