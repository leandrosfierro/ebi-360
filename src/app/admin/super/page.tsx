import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SuperAdminDashboard() {
    const supabase = await createClient();

    // Fetch real stats
    const { count: companiesCount } = await supabase.from("companies").select("*", { count: "exact", head: true });
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: resultsCount } = await supabase.from("results").select("*", { count: "exact", head: true });

    // Calculate average global score
    const { data: results } = await supabase.from("results").select("global_score");
    const averageScore = results?.length
        ? (results.reduce((acc, curr) => acc + Number(curr.global_score), 0) / results.length).toFixed(1)
        : "0.0";

    // Fetch Recent Companies
    const { data: recentCompanies } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard General</h2>
                <p className="text-gray-500">Bienvenido al panel de control de Bienestar 360°.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{companiesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Total registradas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Usuarios registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Encuestas Completadas</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resultsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Total históricas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio Global</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageScore}</div>
                        <p className="text-xs text-muted-foreground">Promedio general</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Companies List */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Empresas Recientes</h3>
                        <Link href="/admin/super/companies" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Ver todas
                        </Link>
                    </div>
                    <div className="mt-4">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Empresa</th>
                                    <th className="px-4 py-3 font-medium">Plan</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium">Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentCompanies && recentCompanies.length > 0 ? (
                                    recentCompanies.map((company) => (
                                        <tr key={company.id}>
                                            <td className="px-4 py-3 font-medium">{company.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                                    ${company.subscription_plan === 'enterprise' ? 'bg-blue-100 text-blue-800' :
                                                        company.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {company.subscription_plan.charAt(0).toUpperCase() + company.subscription_plan.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                                    ${company.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {company.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(company.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            No hay empresas registradas recientemente.
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
