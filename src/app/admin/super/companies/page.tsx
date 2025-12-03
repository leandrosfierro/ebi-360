import { createClient } from "@/lib/supabase/server";
import { Plus, Search, MoreHorizontal, Building2 } from "lucide-react";
import Link from "next/link";

export default async function CompaniesPage() {
    const supabase = await createClient();
    const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Empresas</h2>
                    <p className="text-gray-500">Gestiona las empresas clientes y sus suscripciones.</p>
                </div>
                <Link
                    href="/admin/super/companies/new"
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Empresa
                </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar empresa..."
                        className="w-full rounded-md border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                </div>
                <select className="rounded-md border border-gray-200 px-4 py-2 text-sm outline-none focus:border-purple-500">
                    <option value="all">Todos los planes</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            {/* Companies List */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Empresa</th>
                            <th className="px-6 py-4 font-medium">Plan</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Fecha Registro</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {companies && companies.length > 0 ? (
                            companies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                                {company.logo_url ? (
                                                    <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                                                ) : (
                                                    <Building2 className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{company.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{company.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${company.subscription_plan === 'enterprise' ? 'bg-blue-100 text-blue-800' :
                                                company.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {company.subscription_plan.charAt(0).toUpperCase() + company.subscription_plan.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${company.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {company.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(company.created_at).toLocaleDateString()}
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
                                        <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-lg font-medium text-gray-900">No hay empresas registradas</p>
                                        <p className="text-sm text-gray-500 mb-4">Comienza registrando la primera empresa cliente.</p>
                                        <Link
                                            href="/admin/super/companies/new"
                                            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                        >
                                            Registrar Empresa
                                        </Link>
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
