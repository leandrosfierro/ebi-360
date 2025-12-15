import Link from "next/link";
import { LayoutDashboard, Users, Building2, Settings, LogOut, Shield } from "lucide-react";
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
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-purple-800">EBI 360</h1>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-b border-gray-200 mb-3 pb-3">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Volver al Home</span>
                    </Link>
                    <Link href="/admin/super" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/super/companies" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        <Building2 className="h-5 w-5" />
                        <span>Empresas</span>
                    </Link>
                    <Link href="/admin/super/admins" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        <Shield className="h-5 w-5" />
                        <span>Super Admins</span>
                    </Link>
                    <Link href="/admin/super/settings" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        <Settings className="h-5 w-5" />
                        <span>Configuración</span>
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50">
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
