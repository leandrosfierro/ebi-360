import { createClient, createAdminClient } from "@/lib/supabase/server";
import { InviteSuperAdminDialog } from "@/components/admin/InviteSuperAdminDialog";
import { Shield } from "lucide-react";
import { isSuperAdminEmail } from "@/config/super-admins";

export default async function SuperAdminsPage() {
    let supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isSuperAdminEmail(user.email || '')) {
        supabase = createAdminClient();
    }

    // Fetch all super admin users
    const { data: superAdmins } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, admin_status')
        .or('role.eq.super_admin,active_role.eq.super_admin')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Super Administradores
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona los usuarios con acceso de super administrador
                    </p>
                </div>
                <InviteSuperAdminDialog />
            </div>

            {/* Super Admins Table */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-muted-foreground">
                                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Nombre</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Email</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {superAdmins && superAdmins.length > 0 ? (
                                    superAdmins.map((admin) => (
                                        <tr key={admin.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-bold text-foreground">{admin.full_name || "Sin nombre"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium">
                                                {admin.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${admin.admin_status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : admin.admin_status === 'invited'
                                                            ? 'bg-amber-500/10 text-amber-500'
                                                            : 'bg-gray-500/10 text-gray-400'
                                                        }`}
                                                >
                                                    {admin.admin_status === 'active'
                                                        ? 'Activo'
                                                        : admin.admin_status === 'invited'
                                                            ? 'Invitado'
                                                            : admin.admin_status || 'Activo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(admin.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Shield className="h-8 w-8 text-primary/30" />
                                            </div>
                                            <p className="text-foreground font-bold">
                                                No hay super administradores registrados
                                            </p>
                                            <p className="text-muted-foreground text-sm mt-1 italic">
                                                Invita al primer super administrador para comenzar
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
