import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SuperAdminDashboard() {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    // Fetch real stats
    // Fetch real stats with resilience
    const { count: companiesCount, error: companiesErr } = await supabase.from("companies").select("*", { count: "exact", head: true });
    const { count: usersCount, error: usersErr } = await supabase.from("profiles").select("*", { count: "exact", head: true });

    // Check if surveys table exists by wrapping in a try or checking error
    const { count: resultsCount, error: resultsErr } = await supabase.from("results").select("*", { count: "exact", head: true });
    const { count: surveysCount, error: surveysErr } = await supabase.from("surveys").select("*", { count: "exact", head: true });

    // Calculate average global score safely
    const { data: results, error: scoreErr } = await supabase.from("results").select("global_score");
    const averageScore = results && results.length > 0
        ? (results.reduce((acc, curr) => acc + (Number(curr.global_score) || 0), 0) / results.length).toFixed(1)
        : "0.0";

    // Fetch Recent Companies
    const { data: recentCompanies, error: recentErr } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    if (resultsErr || surveysErr || scoreErr) {
        console.warn("Dashboard potential data missing:", { resultsErr, surveysErr, scoreErr });
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard General</h2>
                <p className="text-muted-foreground">Bienvenido al panel de control de EBI 360.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground/80">Empresas Activas</CardTitle>
                        <Building2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{companiesCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total registradas</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground/80">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{usersCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Usuarios registrados</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground/80">Encuestas</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{surveysCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sistemas disponibles</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground/80">Completadas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{resultsCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Respuestas totales</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground/80">Promedio Global</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{averageScore}</div>
                        <p className="text-xs text-muted-foreground mt-1">Promedio general</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Companies List */}
            <div className="glass-card rounded-[24px] overflow-hidden shadow-sm">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground">Empresas Recientes</h3>
                        <Link href="/admin/super/companies" className="text-sm text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors">
                            Ver todas
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-muted-foreground">
                                    <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px]">Empresa</th>
                                    <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px]">Plan</th>
                                    <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                                    <th className="px-4 py-4 font-bold uppercase tracking-widest text-[10px]">Fecha Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentCompanies && recentCompanies.length > 0 ? (
                                    recentCompanies.map((company) => (
                                        <tr key={company.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4 font-bold text-foreground">{company.name}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${company.subscription_plan === 'enterprise' ? 'bg-blue-500/10 text-blue-500' :
                                                        company.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-gray-500/10 text-gray-500'}`}>
                                                    {company.subscription_plan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${company.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {company.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {new Date(company.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground italic">
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
