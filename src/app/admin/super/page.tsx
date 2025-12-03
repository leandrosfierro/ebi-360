import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

            {/* Recent Activity / Companies List Placeholder */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium">Empresas Recientes</h3>
                    <div className="mt-4">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Empresa</th>
                                    <th className="px-4 py-3 font-medium">Plan</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium">Usuarios</th>
                                    <th className="px-4 py-3 font-medium">Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-4 py-3 font-medium">Tech Solutions SA</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">Enterprise</span></td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Activo</span></td>
                                    <td className="px-4 py-3">450</td>
                                    <td className="px-4 py-3 text-gray-500">01 Dic 2025</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Consultora Global</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">Pro</span></td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Activo</span></td>
                                    <td className="px-4 py-3">120</td>
                                    <td className="px-4 py-3 text-gray-500">28 Nov 2025</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">StartUp Innova</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Basic</span></td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Pendiente</span></td>
                                    <td className="px-4 py-3">15</td>
                                    <td className="px-4 py-3 text-gray-500">25 Nov 2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
