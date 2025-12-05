"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";

interface CompanyAdminLayoutClientProps {
    children: React.ReactNode;
    userRoles: string[];
    activeRole: string;
}

export default function CompanyAdminLayoutClient({
    children,
    userRoles,
    activeRole
}: CompanyAdminLayoutClientProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Empresa Panel</h1>
                    <p className="text-xs text-gray-500">Administración</p>
                    <div className="mt-4">
                        <RoleSwitcher currentRole={activeRole} availableRoles={userRoles} />
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-200 mb-3 pb-3">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Volver al Home
                    </Link>
                    <Link href="/admin/company" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${pathname === '/admin/company' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/company/employees" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${pathname === '/admin/company/employees' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Users className="h-5 w-5" />
                        Colaboradores
                    </Link>
                    <Link href="/admin/company/reports" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${pathname === '/admin/company/reports' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <FileText className="h-5 w-5" />
                        Reportes
                    </Link>
                    <Link href="/admin/company/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${pathname === '/admin/company/settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Settings className="h-5 w-5" />
                        Configuración
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
