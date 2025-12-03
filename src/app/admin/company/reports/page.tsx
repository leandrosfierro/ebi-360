import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Settings, TrendingUp, Users, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get company_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

    const companyId = profile?.company_id;

    // Get user IDs for this company
    const { data: companyProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', companyId);

    const userIds = companyProfiles?.map(p => p.id) || [];

    // Fetch all results for this company
    const { data: allResults } = await supabase
        .from('results')
        .select(`
      global_score,
      domain_scores,
      created_at,
      user_id
    `)
        .in('user_id', userIds);

    // Calculate metrics
    const totalEmployees = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('role', 'employee');

    const employeesCount = totalEmployees.count || 0;
    const completedSurveys = allResults?.length || 0;
    const participationRate = employeesCount > 0 ? Math.round((completedSurveys / employeesCount) * 100) : 0;

    // Calculate average global score
    const avgGlobalScore = allResults && allResults.length > 0
        ? (allResults.reduce((sum, r) => sum + Number(r.global_score), 0) / allResults.length).toFixed(1)
        : "0.0";

    // Calculate domain averages
    const domainAverages: Record<string, number> = {};
    if (allResults && allResults.length > 0) {
        const domains = ["Físico", "Nutricional", "Emocional", "Social", "Familiar", "Económico"];
        domains.forEach(domain => {
            const scores = allResults
                .map(r => r.domain_scores?.[domain])
                .filter(s => s !== undefined && s !== null);
            domainAverages[domain] = scores.length > 0
                ? scores.reduce((sum, s) => sum + Number(s), 0) / scores.length
                : 0;
        });
    }

    // Prepare data for charts
    const domainChartData = Object.entries(domainAverages).map(([name, value]) => ({
        name,
        score: Number(value.toFixed(1)),
    }));

    // Risk detection (scores below 5)
    const atRiskCount = allResults?.filter(r => Number(r.global_score) < 5).length || 0;

    // Trend data (group by month if multiple surveys)
    const trendData = allResults && allResults.length > 0
        ? allResults.reduce((acc: any[], result) => {
            const month = new Date(result.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
            const existing = acc.find(item => item.month === month);
            if (existing) {
                existing.total += Number(result.global_score);
                existing.count += 1;
            } else {
                acc.push({ month, total: Number(result.global_score), count: 1 });
            }
            return acc;
        }, []).map(item => ({
            month: item.month,
            score: Number((item.total / item.count).toFixed(1)),
        }))
        : [];

    const COLORS = ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reportes de Bienestar</h2>
                    <p className="text-gray-500">Análisis agregado del bienestar organizacional.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/company/settings"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        Configurar Branding
                    </Link>
                    <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                        <Download className="h-4 w-4" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Participación</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{participationRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {completedSurveys} de {employeesCount} colaboradores
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Índice de Bienestar</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgGlobalScore}</div>
                        <p className="text-xs text-muted-foreground">Promedio general</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Detección de Riesgo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{atRiskCount}</div>
                        <p className="text-xs text-muted-foreground">Colaboradores con puntaje bajo</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Encuestas Completadas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedSurveys}</div>
                        <p className="text-xs text-muted-foreground">Total histórico</p>
                    </CardContent>
                </Card>
            </div>

            {/* Domain Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Promedio por Dimensión</CardTitle>
                </CardHeader>
                <CardContent>
                    {domainChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={domainChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#7e22ce" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-gray-500">
                            No hay datos suficientes para mostrar
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Trend Over Time */}
            {trendData.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Evolución en el Tiempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#7e22ce" strokeWidth={2} name="Índice de Bienestar" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Domain Distribution (Pie Chart) */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribución de Puntajes por Dimensión</CardTitle>
                </CardHeader>
                <CardContent>
                    {domainChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={domainChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="score"
                                >
                                    {domainChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-gray-500">
                            No hay datos suficientes para mostrar
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
