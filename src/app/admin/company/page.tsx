import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, TrendingUp, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { EmptyState } from "@/components/admin/EmptyState";
import { redirect } from "next/navigation";

export default async function CompanyAdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get company_id from profile
    // Get company_id/role from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role, active_role, roles")
        .eq("id", user.id)
        .single();

    // Allow Super Admin to pass even without company_id (View Mode)
    // Check if 'super_admin' exists in the roles array OR if it's the current role
    const hasSuperAdminPrivileges = profile?.roles?.includes('super_admin') ||
        profile?.role === 'super_admin' ||
        profile?.active_role === 'super_admin';

    let companyId = profile?.company_id;

    if (!companyId) {
        if (hasSuperAdminPrivileges) {
            // If Super Admin has no company selected, try to fetch the first active company to show data
            // Alternatively, show a "Select Company" screen.
            const { data: firstCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('active', true)
                .limit(1)
                .single();

            if (firstCompany) {
                companyId = firstCompany.id;
            } else {
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-800">Vista Global (Sin Empresas)</h2>
                        <p className="text-gray-500">Eres Super Admin, pero no hay empresas activas para mostrar en este dashboard.</p>
                    </div>
                );
            }
        } else {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600">Error de Configuración</h2>
                    <p className="text-gray-500">No tienes una empresa asignada. Contacta al soporte.</p>
                </div>
            );
        }
    }

    // 1. Fetch Employees Count (only employees, not admins)
    const { count: employeesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .or("role.eq.employee,active_role.eq.employee");

    // 2. Fetch Results for Company
    // First get all employee IDs from the company (only employees)
    const { data: companyEmployees } = await supabase
        .from("profiles")
        .select("id")
        .eq("company_id", companyId)
        .or("role.eq.employee,active_role.eq.employee");

    const employeeIds = companyEmployees?.map(e => e.id) || [];

    // Then fetch results for those employees with count
    const { data: results, count: resultsCount } = await supabase
        .from("results")
        .select("global_score, domain_scores, user_id", { count: "exact" })
        .in("user_id", employeeIds);

    const totalEmployees = employeesCount || 0;
    const totalResults = resultsCount || 0;

    console.log("Dashboard Debug:", {
        companyId,
        totalEmployees,
        totalResults,
        employeeIds: employeeIds.length,
        resultsData: results?.length
    });

    // EMPTY STATE CHECK
    if (totalEmployees === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard de Empresa</h2>
                    <p className="text-gray-500">Bienvenido al panel de administración.</p>
                </div>
                <EmptyState type="no_employees" />
            </div>
        );
    }

    if (totalResults === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard de Empresa</h2>
                    <p className="text-gray-500">Resumen del estado de bienestar de tu organización.</p>
                </div>

                {/* Show stats with 0 values */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardStats
                        title="Colaboradores"
                        value={totalEmployees}
                        description="Total registrados"
                        icon={Users}
                    />
                    <DashboardStats
                        title="Participación"
                        value="0%"
                        description="0 encuestas completadas"
                        icon={FileCheck}
                    />
                    <DashboardStats
                        title="Índice de Bienestar"
                        value="-"
                        description="Esperando datos"
                        icon={TrendingUp}
                    />
                    <DashboardStats
                        title="Riesgo Detectado"
                        value="-"
                        description="Esperando datos"
                        icon={AlertCircle}
                    />
                </div>

                <EmptyState type="no_results" />
            </div>
        );
    }

    // CALCULATE METRICS
    // Count unique users who completed surveys
    const uniqueUsersWithResults = results
        ? new Set(results.map(r => r.user_id)).size
        : 0;

    // Participation rate based on unique users, capped at 100%
    const participationRate = totalEmployees > 0
        ? Math.min(100, Math.round((uniqueUsersWithResults / totalEmployees) * 100))
        : 0;

    // Average Global Score
    const averageScore = results?.length
        ? (results.reduce((acc, curr) => acc + Number(curr.global_score), 0) / results.length).toFixed(1)
        : "0.0";

    // Risk Calculation (Score < 5)
    const riskCount = results?.filter(r => Number(r.global_score) < 5).length || 0;
    const riskPercentage = totalResults > 0 ? Math.round((riskCount / totalResults) * 100) : 0;

    // Domain Averages
    const domains = ["Físico", "Emocional", "Social", "Profesional", "Intelectual", "Financiero"];
    const domainAverages = domains.map(domain => {
        const total = results?.reduce((acc, curr) => {
            // domain_scores is JSONB, need to cast or access safely
            const scores = curr.domain_scores as Record<string, number>;
            return acc + (scores[domain] || 0);
        }, 0) || 0;
        return {
            name: domain,
            value: (total / (results?.length || 1)).toFixed(1)
        };
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard de Empresa</h2>
                <p className="text-gray-500">Resumen del estado de bienestar de tu organización.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardStats
                    title="Colaboradores"
                    value={totalEmployees}
                    description="Total registrados"
                    icon={Users}
                />
                <DashboardStats
                    title="Participación"
                    value={`${participationRate}%`}
                    description={`${uniqueUsersWithResults} de ${totalEmployees} colaboradores (${totalResults} encuestas)`}
                    icon={FileCheck}
                />
                <DashboardStats
                    title="Índice de Bienestar"
                    value={averageScore}
                    description="Promedio general"
                    icon={TrendingUp}
                />
                <DashboardStats
                    title="Riesgo Detectado"
                    value={`${riskPercentage}%`}
                    description={`${riskCount} colaboradores en riesgo`}
                    icon={AlertCircle}
                    alert={riskPercentage > 10}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Evolución del Bienestar</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                            <p className="text-sm text-gray-400">Gráfico de evolución temporal (Próximamente)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Desglose por Dominio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {domainAverages.map((domain) => (
                                <div key={domain.name} className="flex items-center">
                                    <div className="w-full flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{domain.name}</p>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div
                                                className={`h-2 rounded-full ${Number(domain.value) >= 7 ? 'bg-green-500' : Number(domain.value) >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${Number(domain.value) * 10}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="ml-4 text-sm font-bold">{domain.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
