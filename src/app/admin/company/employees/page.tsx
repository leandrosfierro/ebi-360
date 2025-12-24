import { createClient } from "@/lib/supabase/server";
import { Plus, Search, Mail, Upload, MoreHorizontal, User, Users } from "lucide-react";
import Link from "next/link";
import { InviteEmployeeDialog } from "@/components/admin/company/InviteEmployeeDialog";
import { EmployeeActionsMenu } from "@/components/admin/company/EmployeeActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Colaboradores</h2>
                    <p className="text-muted-foreground italic flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Gestiona el acceso y seguimiento de tu equipo.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/company/employees/upload"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-foreground hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Upload className="h-4 w-4 text-primary" />
                        Carga Masiva
                    </Link>
                    <InviteEmployeeDialog />
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 glass-card p-4 rounded-[24px] shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full rounded-xl border border-white/10 bg-white/10 pl-11 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
                <select className="w-full md:w-auto rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all">
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                </select>
            </div>

            {/* Employees List */}
            <div className="glass-card rounded-[32px] overflow-hidden shadow-xl border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Colaborador</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Rol</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Último Acceso</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {employees && employees.length > 0 ? (
                                employees.map((employee) => (
                                    <tr key={employee.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                                                    {employee.avatar_url ? (
                                                        <img src={employee.avatar_url} alt={employee.full_name} className="h-full w-full object-cover rounded-2xl" />
                                                    ) : (
                                                        <User className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground leading-none mb-1">{employee.full_name || "Sin nombre"}</p>
                                                    <p className="text-[11px] text-muted-foreground">{employee.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                                                {employee.role === 'company_admin' ? 'Administrador' : 'Colaborador'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={(employee.admin_status as any) || 'invited'} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-[11px] font-medium">
                                            {new Date(employee.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <EmployeeActionsMenu employee={employee} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                                <Users className="h-8 w-8 text-primary/40" />
                                            </div>
                                            <p className="text-lg font-bold text-foreground">No hay colaboradores registrados</p>
                                            <p className="text-sm text-muted-foreground mb-6 italic">Comienza invitando a tu equipo para ver datos aquí.</p>
                                            <InviteEmployeeDialog />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
