"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Activity, User, Target, ClipboardCheck, TrendingUp } from "lucide-react";
import { AdminSidebarLinks } from "@/components/admin/AdminSidebarLinks";
import { BottomNav } from "./BottomNav";
import { createClient } from "@/lib/supabase/client";

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
    const pathname = usePathname();
    const [profile, setProfile] = useState<any>(null);
    const [primaryColor, setPrimaryColor] = useState<string | null>(null);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuth(true);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role, roles, active_role, company_id')
                    .eq('id', user.id)
                    .maybeSingle();

                setProfile(profileData);

                if (profileData?.company_id) {
                    const { data: companyData } = await supabase
                        .from('companies')
                        .select('primary_color')
                        .eq('id', profileData.company_id)
                        .maybeSingle();
                    setPrimaryColor(companyData?.primary_color);
                }
            } else {
                setIsAuth(false);
            }
        }
        fetchProfile();
    }, [pathname]);

    const isAdminRoute = pathname?.startsWith("/admin");
    const isDiagnostic = pathname?.startsWith("/diagnostico");
    const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/auth");

    // Si no hay sesión o es ruta de auth, solo mostramos el contenido sin sidebar
    if (!isAuth || isAuthRoute) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <main className="flex-1 w-full mx-auto max-w-md md:max-w-none">
                    {children}
                </main>
            </div>
        );
    }

    const navLinks = [
        { href: "/", label: "Inicio", icon: "Home" },
        { href: "/wellbeing", label: "Mi Rueda", icon: "Activity" },
        { href: "/diagnostico", label: "Diagnóstico", icon: "ClipboardCheck" },
        { href: "/resultados", label: "Resultados", icon: "TrendingUp" },
        { href: "/perfil", label: "Mi Perfil", icon: "User" },
    ];

    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'company_admin' || (profile?.roles || []).includes('super_admin');
    const adminPath = (profile?.active_role === 'super_admin' || profile?.role === 'super_admin') ? "/admin/super" : "/admin/company";
    const shouldShowBottomNav = showNav && !isAdminRoute && !isDiagnostic;

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background">
            {/* Desktop Sidebar */}
            <aside className="w-72 glass-panel border-r border-white/20 hidden md:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Image
                            src="/logo-bs360.png"
                            alt="Bs360"
                            width={140}
                            height={40}
                            className="object-contain logo-color-filter"
                            priority
                        />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Bienestar Integral</p>
                </div>

                <nav className="flex-1 px-4 space-y-4">
                    <div>
                        <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Herramientas</p>
                        <AdminSidebarLinks links={navLinks} primaryColor={primaryColor} />
                    </div>

                    {isAdmin && (
                        <div>
                            <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Administración</p>
                            <Link href={adminPath} className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-primary transition-all">
                                <Target className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <span>Panel Admin</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95">
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header (Only visible on mobile) */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border-b border-white/20 sticky top-0 z-30">
                <Image src="/logo-bs360.png" alt="Bs360" width={100} height={30} className="object-contain logo-color-filter" />
                <div className="flex gap-4">
                    <Link href="/" className="p-2"><Home className="h-5 w-5 text-muted-foreground" /></Link>
                    <Link href="/wellbeing" className="p-2"><Activity className="h-5 w-5 text-primary" /></Link>
                    <Link href="/perfil" className="p-2"><User className="h-5 w-5 text-muted-foreground" /></Link>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                <div className={`flex-1 w-full ${!isAdminRoute ? 'max-w-md md:max-w-none mx-auto' : ''}`}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            {shouldShowBottomNav && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
