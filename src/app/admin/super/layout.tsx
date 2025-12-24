import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    Shield,
    Mail,
    Home,
    BookOpen,
    ClipboardCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MobileAdminNav } from "@/components/layout/MobileAdminNav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
        redirect("/login");
    }

    const navLinks = [
        { href: "/admin/super", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/super/companies", label: "Empresas", icon: Building2 },
        { href: "/admin/super/admins", label: "Super Admins", icon: Shield },
        { href: "/admin/super/emails", label: "Emails", icon: Mail },
        { href: "/admin/super/surveys", label: "Encuestas", icon: ClipboardCheck },
        { href: "/admin/super/docs", label: "Documentación", icon: BookOpen },
        { href: "/admin/super/settings", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-mesh-gradient text-foreground transition-colors duration-500 flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="w-72 glass-panel border-r border-white/20 hidden md:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative h-10 w-40">
                            <Image
                                src="/logo-bs360.png"
                                alt="Bienestar 360"
                                fill
                                className="object-contain object-left logo-color-filter"
                                priority
                            />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Super Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    <div className="mb-4">
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Principal</p>
                        <Link href="/" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-primary transition-all">
                            <Home className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                            <span>Volver al Home</span>
                        </Link>
                        {navLinks.slice(0, 1).map(link => (
                            <Link key={link.href} href={link.href} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-primary transition-all">
                                <link.icon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Gestión</p>
                        {navLinks.slice(1, 4).map(link => (
                            <Link key={link.href} href={link.href} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-primary transition-all">
                                <link.icon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Sistema</p>
                        {navLinks.slice(4).map(link => (
                            <Link key={link.href} href={link.href} className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-primary transition-all">
                                <link.icon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
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
            </aside>

            {/* Mobile Nav */}
            <MobileAdminNav
                title="Super Admin"
                links={navLinks}
                role="Super Administrador"
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
