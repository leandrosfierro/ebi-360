import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, LogOut, PieChart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanyAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Empresa Panel</h1>
                    <p className="text-xs text-gray-500">Administración</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin/company" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/company/employees" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <Users className="h-5 w-5" />
                        <span>Colaboradores</span>
                    </Link>
                    <Link href="/admin/company/reports" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <PieChart className="h-5 w-5" />
                        <span>Reportes</span>
                    </Link>
                    <Link href="/admin/company/settings" className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700">
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
