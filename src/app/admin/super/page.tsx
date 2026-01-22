import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp, Activity } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { isSuperAdminEmail } from "@/config/super-admins";

export default async function SuperAdminDashboard() {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Si es master admin, usar cliente admin para asegurar estadísticas correctas
        if (user && isSuperAdminEmail(user.email || '')) {
            supabase = createAdminClient();
        }

        // Fetch real stats with individual error handling to prevent total failure
        const getCompanies = async () => {
            const { count, error } = await supabase.from("companies").select("*", { count: "exact", head: true });
            if (error) console.error("Error fetching companies:", error);
            return count || 0;
        };

        const getUsers = async () => {
            const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
            if (error) console.error("Error fetching users:", error);
            return count || 0;
        };

        const getResultsCount = async () => {
            const { count, error } = await supabase.from("results").select("*", { count: "exact", head: true });
            if (error) console.error("Error fetching results count:", error);
            return count || 0;
        };

        const getSurveysCount = async () => {
            const { data, error: countError } = await supabase.from("surveys").select("id");
            if (countError) {
                console.error("Error fetching surveys count:", countError);
                return 0;
            }
            return data?.length || 0;
        };

        const getGlobalScore = async () => {
            const { data, error } = await supabase.from("results").select("global_score");
            if (error) {
                console.error("Error fetching global score:", error);
                return "0.0";
            }
            if (!data || data.length === 0) return "0.0";

            const total = data.reduce((acc: number, curr: { global_score: any }) =>
                acc + (Number(curr.global_score) || 0), 0
            );
            return (total / data.length).toFixed(1);
        };

        const getRecentCompanies = async () => {
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5);
            if (error) console.error("Error fetching recent companies:", error);
            return data || [];
        };

        // Parallelize fetching for better performance
        const [
            companiesCount,
            usersCount,
            resultsCount,
            surveysCount,
            averageScore,
            recentCompanies
        ] = await Promise.all([
            getCompanies(),
            getUsers(),
            getResultsCount(),
            getSurveysCount(),
            getGlobalScore(),
            getRecentCompanies()
        ]);

        return (
            <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-12">
                {/* 1. Header with Global Identity */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 animate-slideDown">
                            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Shield className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                Global Command Center
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                            Panel <span className="text-primary italic">Global</span>
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium mt-2">
                            Gestión integral de la infraestructura y clientes de EBI 360.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-sm">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</p>
                            <p className="text-xs font-black text-foreground mt-1 underline decoration-emerald-500/30">Plataforma Activa</p>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Access Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/super/companies" className="group relative overflow-hidden glass-card p-8 rounded-[40px] border-none shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2">Empresas</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Gestionar clientes, suscripciones y planes.
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    </Link>

                    <Link href="/admin/super/admins" className="group relative overflow-hidden glass-card p-8 rounded-[40px] border-none shadow-xl hover:shadow-purple/10 transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2">Super Admins</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Control de accesos y roles maestros del sistema.
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    </Link>

                    <Link href="/admin/super/surveys" className="group relative overflow-hidden glass-card p-8 rounded-[40px] border-none shadow-xl hover:shadow-amber/10 transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2">Sistemas</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configuración de encuestas y algoritmos de IA.
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    </Link>

                    <Link href="/admin/super/settings" className="group relative overflow-hidden glass-card p-8 rounded-[40px] border-none shadow-xl transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2">Configuración</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Parámetros globales y mantenimiento de red.
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    </Link>
                </div>

                {/* 3. Platform Metrics Pulse */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {[
                        { title: "Empresas", value: companiesCount, sub: "Activas hoy", color: "text-blue-500" },
                        { title: "Usuarios", value: usersCount, sub: "Total sistema", color: "text-purple-500" },
                        { title: "Sistemas", value: surveysCount, sub: "Desplegados", color: "text-amber-500" },
                        { title: "Respuestas", value: resultsCount, sub: "Participación", color: "text-emerald-500" },
                        { title: "Avg Score", value: averageScore, sub: "Bienestar Global", color: "text-rose-500" },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 rounded-[32px] border-white/5 shadow-sm group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{stat.title}</p>
                            <div className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* 4. Recent Activity / Companies List */}
                <div className="glass-card rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
                    <div className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Altas Recientes</h3>
                            </div>
                            <Link href="/admin/super/companies" className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground hover:bg-white/10 font-black uppercase tracking-widest transition-all">
                                Ver todas
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Empresa</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Plan</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Estado</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Registro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentCompanies && recentCompanies.length > 0 ? (
                                        recentCompanies.map((company: any) => (
                                            <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-6">
                                                    <p className="font-black text-foreground text-lg">{company.name}</p>
                                                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">ID: {company.id.slice(0, 8)}...</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider
                                                        ${company.subscription_plan === 'enterprise' ? 'bg-blue-500/10 text-blue-500' :
                                                            company.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-500' :
                                                                'bg-gray-500/10 text-gray-500'}`}>
                                                        {company.subscription_plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-2 w-2 rounded-full ${company.active ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                                                            {company.active ? 'Operativo' : 'Suspendido'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-bold text-muted-foreground">
                                                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                        <Building2 className="h-8 w-8 text-muted-foreground/30" />
                                                    </div>
                                                    <p className="text-muted-foreground font-bold italic mb-6">No hay empresas registradas recientemente.</p>
                                                    <Link 
                                                      href="/admin/super/companies" 
                                                      className="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                    >
                                                        Registrar Primera Empresa
                                                    </Link>
                                                </div>
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
    } catch (error: any) {
        console.error("Critical Dashboard Error:", error);
        return (
            <div className="p-12 text-center glass-card rounded-[40px] border border-rose-500/20 max-w-2xl mx-auto my-20">
                <div className="w-20 h-20 bg-rose-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-10 w-10 text-rose-500" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Error de Conexión</h2>
                <p className="text-muted-foreground text-lg mb-8 font-medium">Ocurrió un error inesperado al conectar con los servicios vitales del sistema.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    Reintentar Conexión
                </button>
            </div>
        );
    }
}
