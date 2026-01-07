import { createClient } from "@/lib/supabase/server";
import { Users, Upload } from "lucide-react";
import Link from "next/link";
import { InviteEmployeeDialog } from "@/components/admin/company/InviteEmployeeDialog";
import { EmployeeTableClient } from "@/components/admin/company/EmployeeTableClient";

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

            {/* Client Component for filtering, selection and bulk actions */}
            {employees && employees.length > 0 ? (
                <EmployeeTableClient employees={employees} />
            ) : (
                <div className="glass-card rounded-[32px] overflow-hidden shadow-xl border-none">
                    <div className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-primary/40" />
                            </div>
                            <p className="text-lg font-bold text-foreground">No hay colaboradores registrados</p>
                            <p className="text-sm text-muted-foreground mb-6 italic">Comienza invitando a tu equipo para ver datos aquí.</p>
                            <InviteEmployeeDialog />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
