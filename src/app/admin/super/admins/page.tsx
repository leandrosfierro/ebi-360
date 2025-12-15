import { createClient } from "@/lib/supabase/server";
import { InviteSuperAdminDialog } from "@/components/admin/InviteSuperAdminDialog";
import { Shield } from "lucide-react";

export default async function SuperAdminsPage() {
    const supabase = await createClient();

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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Super Administradores
                    </h2>
                    <p className="text-gray-500">
                        Gestiona los usuarios con acceso de super administrador
                    </p>
                </div>
                <InviteSuperAdminDialog />
            </div>

            {/* Super Admins Table */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium">Fecha Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {superAdmins && superAdmins.length > 0 ? (
                                superAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-purple-600" />
                                                {admin.full_name || "Sin nombre"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {admin.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${admin.admin_status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : admin.admin_status === 'invited'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {admin.admin_status === 'active'
                                                    ? 'Activo'
                                                    : admin.admin_status === 'invited'
                                                        ? 'Invitado'
                                                        : admin.admin_status || 'Activo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(admin.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center">
                                        <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">
                                            No hay super administradores registrados
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
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
    );
}
