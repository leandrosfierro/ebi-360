import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Plus, Search, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { InviteAdminDialog } from "@/components/admin/InviteAdminDialog";
import { CompanyActionsMenu } from "@/components/admin/CompanyActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isSuperAdminEmail } from "@/config/super-admins";

export default async function CompaniesPage() {
    let supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isMaster = user && isSuperAdminEmail(user.email || '');

    console.log(">>> [COMPANIES PAGE] Current user email:", user?.email);
    console.log(">>> [COMPANIES PAGE] Is Master Admin:", isMaster);

    // Si es super admin por email, usar cliente admin para asegurar visibilidad total
    if (isMaster) {
        supabase = createAdminClient();
    }

    // Fetch companies with their admin information
    const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select(`
            *,
            profiles(
                id,
                email,
                full_name,
                admin_status,
                last_active_at,
                role
            )
        `)
        .order("created_at", { ascending: false });

    if (companiesError) {
        console.error(">>> [COMPANIES PAGE] Error fetching companies:", companiesError);
    }

    // Adapt the data structure to match what the UI expects (admin property)
    const adaptedCompanies = companies?.map(company => ({
        ...company,
        admin: company.profiles?.find((p: any) => p.role === 'company_admin') || company.profiles?.[0] || null
    })) || [];

    console.log(">>> [COMPANIES PAGE] Companies found:", adaptedCompanies.length);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Gestiona las empresas clientes y sus suscripciones.
                    </p>
                </div>
                <Link
                    href="/admin/super/companies/new"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Empresa
                </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 glass-card p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar empresa..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
                <select className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-all">
                    <option value="all">Todos los planes</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            {/* Companies List */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-muted-foreground">
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Empresa</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Plan</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Administrador</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Estado Admin</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Última Actividad</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {adaptedCompanies && adaptedCompanies.length > 0 ? (
                                adaptedCompanies.map((company: any) => {
                                    const admin = company.admin;

                                    return (
                                        <tr key={company.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        {company.logo_url ? (
                                                            <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover rounded-xl" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{company.name}</p>
                                                        <p className="text-[11px] text-muted-foreground">ID: {company.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${company.subscription_plan === 'enterprise' ? 'bg-blue-500/10 text-blue-500' :
                                                        company.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-gray-500/10 text-gray-500'}`}>
                                                    {company.subscription_plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${company.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {company.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {admin ? (
                                                    <div>
                                                        <p className="font-bold text-foreground">{admin.full_name || 'Sin nombre'}</p>
                                                        <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground text-xs italic">Sin asignar</span>
                                                        <InviteAdminDialog companyId={company.id} companyName={company.name} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {admin ? (
                                                    <StatusBadge status={admin.admin_status || 'invited'} />
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {admin?.last_active_at ? (
                                                    <span>{new Date(admin.last_active_at).toLocaleDateString()}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/60 italic">Nunca</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <CompanyActionsMenu company={company} admin={admin} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            {companiesError ? (
                                                <>
                                                    <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                                                        <AlertCircle className="h-8 w-8 text-rose-500" />
                                                    </div>
                                                    <p className="text-lg font-bold text-foreground">Error al cargar empresas</p>
                                                    <p className="text-sm text-muted-foreground mb-6">
                                                        {companiesError.message}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                                        <Building2 className="h-8 w-8 text-primary/40" />
                                                    </div>
                                                    <p className="text-lg font-bold text-foreground">No hay empresas registradas</p>
                                                    <p className="text-sm text-muted-foreground mb-6">Comienza registrando la primera empresa cliente.</p>

                                                    {isMaster && (
                                                        <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-400 font-mono">
                                                            <p>DEBUG: Email: {user?.email}</p>
                                                            <p>Master Admin: {isMaster ? 'SI' : 'NO'}</p>
                                                            <p className="mt-2 text-blue-300 italic">Nota: Tus datos están seguros en la base de datos (vistos en Dashboard). Esto es un problema de visualización de esta sección específica.</p>
                                                        </div>
                                                    )}

                                                    <Link
                                                        href="/admin/super/companies/new"
                                                        className="mt-6 text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs border-b border-primary/30 pb-1"
                                                    >
                                                        Registrar Empresa
                                                    </Link>
                                                </>
                                            )}
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
