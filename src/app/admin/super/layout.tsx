import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Building2, Settings, LogOut, Shield, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // In a real app, we would fetch the user's role here and verify access
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    return (

        <div className="flex min-h-screen bg-mesh-gradient text-foreground">
            {/* Glass Sidebar */}
            <aside className="w-72 glass-panel border-r border-white/20 hidden md:flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative h-10 w-40">
                            <Image
                                src="/logo-bs360.png"
                                alt="Bienestar 360"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest ml-1">Super Admin Dashboard</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    <div className="mb-4">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
                        <Link href="/" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Volver al Home</span>
                        </Link>
                        <Link href="/admin/super" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <LayoutDashboard className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span>Dashboard</span>
                        </Link>
                    </div>

                    <div className="mb-4">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gestión</p>
                        <Link href="/admin/super/companies" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <Building2 className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span>Empresas</span>
                        </Link>
                        <Link href="/admin/super/admins" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <Shield className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span>Super Admins</span>
                        </Link>
                        <Link href="/admin/super/emails" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <Mail className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span>Emails</span>
                        </Link>
                    </div>

                    <div>
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sistema</p>
                        <Link href="/admin/super/settings" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all">
                            <Settings className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            <span>Configuración</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-sm transition-all">
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {/* Top Bar / Header for Mobile could go here later */}
                <div className="mx-auto max-w-7xl animate-fadeIn">
                    {children}
                </div>
            </main>
        </div>
    );
}
