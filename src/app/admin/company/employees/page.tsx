import { createClient } from "@/lib/supabase/server";
import { Plus, Search, Mail, Upload, MoreHorizontal, User, Users } from "lucide-react";
import Link from "next/link";
import { InviteEmployeeDialog } from "@/components/admin/company/InviteEmployeeDialog";

export default async function EmployeesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get company_id of the current admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

    const companyId = profile?.company_id;

    // Fetch employees for this company
    const { data: employees } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Colaboradores</h2>
                    <p className="text-gray-500">Gestiona el acceso y seguimiento de tu equipo.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/company/employees/upload"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Carga Masiva
                    </Link>
                    <InviteEmployeeDialog />
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full rounded-md border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <select className="rounded-md border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                </select>
            </div>

            {/* Employees List */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Colaborador</th>
                            <th className="px-6 py-4 font-medium">Rol</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Último Acceso</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees && employees.length > 0 ? (
                            employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                {employee.avatar_url ? (
                                                    <img src={employee.avatar_url} alt={employee.full_name} className="h-full w-full object-cover rounded-full" />
                                                ) : (
                                                    <User className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{employee.full_name || "Sin nombre"}</p>
                                                <p className="text-xs text-gray-500">{employee.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            {employee.role === 'company_admin' ? 'Administrador' : 'Colaborador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(employee.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-lg font-medium text-gray-900">No hay colaboradores</p>
                                        <p className="text-sm text-gray-500 mb-4">Comienza invitando a tu equipo o carga una lista masiva.</p>
                                        <div className="flex justify-center">
                                            <InviteEmployeeDialog />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
