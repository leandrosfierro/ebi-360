import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { EmptyState } from "@/components/admin/EmptyState";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
                        <h2 className="text-xl font-bold text-foreground">Vista Global (Sin Empresas)</h2>
                        <p className="text-muted-foreground">Eres Super Admin, pero no hay empresas activas para mostrar en este dashboard.</p>
                    </div>
                );
            }
        } else {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-rose-600">Error de Configuración</h2>
                    <p className="text-muted-foreground">No tienes una empresa asignada. Contacta al soporte.</p>
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

    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
        console.log("[Dashboard Debug]", {
            companyId,
            totalEmployees,
            totalResults,
            employeeIds: employeeIds.length,
            resultsData: results?.length
        });
    }

    // EMPTY STATE CHECK
    if (totalEmployees === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Empresa</h2>
                    <p className="text-muted-foreground">Bienvenido al panel de administración.</p>
                </div>
                <EmptyState type="no_employees" />
            </div>
        );
    }

    if (totalResults === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Empresa</h2>
                    <p className="text-muted-foreground">Resumen del estado de bienestar de tu organización.</p>
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Empresa</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Resumen del estado de bienestar de tu organización.
                </p>
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
                    description={`${uniqueUsersWithResults} de ${totalEmployees} colaboradores`}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4 glass-card border-none shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                        <CardTitle className="text-lg font-bold text-foreground">Evolución del Bienestar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[240px] flex flex-col items-center justify-center bg-white/5 rounded-[24px] border border-dashed border-white/10 group hover:border-primary/50 transition-colors">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Temporalmente no disponible</p>
                            <p className="text-xs text-muted-foreground mt-2 italic px-8 text-center">Estamos procesando los datos para mostrarte tendencias precisas.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3 glass-card border-none shadow-xl">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                        <CardTitle className="text-lg font-bold text-foreground font-title">Desglose por Dominio</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {domainAverages.map((domain) => (
                                <div key={domain.name} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">{domain.name}</p>
                                        <span className="text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{domain.value}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-2 rounded-full transition-all duration-1000 ease-out",
                                                Number(domain.value) >= 7 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' :
                                                    Number(domain.value) >= 5 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
                                                        'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                            )}
                                            style={{ width: `${Number(domain.value) * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
