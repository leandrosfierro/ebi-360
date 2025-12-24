"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, TrendingUp, Users, AlertTriangle, Activity } from "lucide-react";
import Link from "next/link";
import { CompanyReportExport } from "@/components/CompanyReportExport";

// Dynamically import Recharts components to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [participationRate, setParticipationRate] = useState(0);
    const [avgGlobalScore, setAvgGlobalScore] = useState("0.0");
    const [atRiskCount, setAtRiskCount] = useState(0);
    const [completedSurveys, setCompletedSurveys] = useState(0);
    const [employeesCount, setEmployeesCount] = useState(0);
    const [uniqueParticipants, setUniqueParticipants] = useState(0);
    const [domainChartData, setDomainChartData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);

    // Survey Filter State
    const [assignedSurveys, setAssignedSurveys] = useState<any[]>([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>("all");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!loading || assignedSurveys.length > 0) {
            fetchData();
        }
    }, [selectedSurveyId]);

    const fetchInitialData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get company_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;

        // Get assigned surveys for filter
        const { data: assignments } = await supabase
            .from('company_surveys')
            .select('*, survey:surveys(*)')
            .eq('company_id', companyId)
            .eq('is_active', true);

        const surveys = (assignments || []).map((a: any) => a.survey);
        setAssignedSurveys(surveys || []);

        await fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        // Get company_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;

        // Get employee IDs for this company
        const { data: companyProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('company_id', companyId)
            .or('role.eq.employee,active_role.eq.employee');

        const userIds = companyProfiles?.map((p: any) => p.id) || [];

        // Fetch results with survey filter
        let query = supabase
            .from('results')
            .select(`
                global_score,
                domain_scores,
                created_at,
                user_id,
                survey_id
            `)
            .in('user_id', userIds);

        if (selectedSurveyId !== "all") {
            query = query.eq('survey_id', selectedSurveyId);
        }

        const { data: allResults } = await query;

        // Calculate metrics
        const totalEmployees = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .or('role.eq.employee,active_role.eq.employee');

        const empCount = totalEmployees.count || 0;

        const uniqueUsersWithResults = allResults
            ? new Set(allResults.map((r: any) => r.user_id)).size
            : 0;

        const totalSurveysCompleted = allResults?.length || 0;
        const partRate = empCount > 0 ? Math.min(100, Math.round((uniqueUsersWithResults / empCount) * 100)) : 0;

        setEmployeesCount(empCount);
        setCompletedSurveys(totalSurveysCompleted);
        setUniqueParticipants(uniqueUsersWithResults);
        setParticipationRate(partRate);

        const avgScore = allResults && allResults.length > 0
            ? (allResults.reduce((sum: number, r: any) => sum + Number(r.global_score), 0) / allResults.length).toFixed(1)
            : "0.0";
        setAvgGlobalScore(avgScore);

        // Identify domains to show
        let domainsToShow = ["Físico", "Nutricional", "Emocional", "Social", "Familiar", "Económico"];
        if (selectedSurveyId !== "all") {
            const survey = assignedSurveys.find(s => s.id === selectedSurveyId);
            if (survey?.calculation_algorithm?.domains) {
                domainsToShow = survey.calculation_algorithm.domains.map((d: any) => d.name);
            }
        }

        const domainAverages: Record<string, number> = {};
        if (allResults && allResults.length > 0) {
            domainsToShow.forEach(domain => {
                const scores = allResults
                    .map((r: any) => r.domain_scores?.[domain])
                    .filter((s: any) => s !== undefined && s !== null);
                domainAverages[domain] = scores.length > 0
                    ? scores.reduce((sum: number, s: any) => sum + Number(s), 0) / scores.length
                    : 0;
            });
        }

        const chartData = Object.entries(domainAverages).map(([name, value]) => ({
            name,
            score: Number(value.toFixed(1)),
        }));
        setDomainChartData(chartData);

        const riskCount = allResults?.filter((r: any) => Number(r.global_score) < 5).length || 0;
        setAtRiskCount(riskCount);

        const trend = allResults && allResults.length > 0
            ? allResults.reduce((acc: any[], result: any) => {
                const month = new Date(result.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                const existing = acc.find((item: any) => item.month === month);
                if (existing) {
                    existing.total += Number(result.global_score);
                    existing.count += 1;
                } else {
                    acc.push({ month, total: Number(result.global_score), count: 1 });
                }
                return acc;
            }, []).map((item: any) => ({
                month: item.month,
                score: Number((item.total / item.count).toFixed(1)),
            }))
            : [];
        setTrendData(trend);

        setLoading(false);
    };

    const COLORS = ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reportes de Bienestar</h2>
                    <p className="text-gray-500">Análisis agregado del bienestar organizacional.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Survey Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Filtrar por:</span>
                        <select
                            value={selectedSurveyId}
                            onChange={(e) => setSelectedSurveyId(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2 transition-all hover:border-purple-400"
                        >
                            <option value="all">Todas las encuestas</option>
                            {assignedSurveys.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Link
                        href="/admin/company/settings"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        Configurar Branding
                    </Link>
                    <CompanyReportExport
                        companyName="Mi Empresa"
                        metrics={{
                            participationRate,
                            avgGlobalScore,
                            atRiskCount,
                            completedSurveys,
                            employeesCount,
                        }}
                    />
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
                            {uniqueParticipants} de {employeesCount} colaboradores ({completedSurveys} encuestas)
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
