"use client";

import { useState, useEffect } from "react";
import { User, Calendar, TrendingUp, Settings, LogOut, ExternalLink, Award, ArrowRight } from "lucide-react";
import { checkAchievements, type Achievement } from "@/lib/achievements";
import { createClient } from "@/lib/supabase/client";
import { RoleCard } from "@/components/profile/RoleCard";

export default function ProfilePage() {
    const [userName, setUserName] = useState("Usuario");
    const [diagnosticCount, setDiagnosticCount] = useState(0);
    const [lastDiagnostic, setLastDiagnostic] = useState<string>("-");
    const [mounted, setMounted] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string>("");

    useEffect(() => {
        setMounted(true);

        const fetchData = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setIsAuthenticated(true);

                    // Fetch profile - Roles and Active Role are already synced by the auth callback
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select(`
                            full_name, 
                            role, 
                            roles, 
                            active_role,
                            company:companies(name)
                        `)
                        .eq("id", user.id)
                        .single();

                    if (profile) {
                        if (profile.role) setUserRole(profile.role);
                        if (profile.roles) setUserRoles(profile.roles);
                        if (profile.active_role) setActiveRole(profile.active_role);

                        if (profile.company && typeof profile.company === 'object' && 'name' in profile.company) {
                            setCompanyName((profile.company as any).name);
                        }

                        if (profile.full_name) {
                            setUserName(profile.full_name);
                        } else if (user.user_metadata?.full_name) {
                            setUserName(user.user_metadata.full_name);
                        }
                    }

                    // Fetch results
                    const { data: results } = await supabase
                        .from("results")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                    if (results && results.length > 0) {
                        setDiagnosticCount(results.length);
                        const lastDate = new Date(results[0].created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        });
                        setLastDiagnostic(lastDate);

                        const latest = results[0];
                        const unlockedAchievements = checkAchievements({
                            diagnosticCount: results.length,
                            globalScore: Number(latest.global_score),
                            scores: latest.domain_scores,
                        });
                        setAchievements(unlockedAchievements);
                    }
                } else {
                    const savedName = localStorage.getItem("ebi_user_name");
                    if (savedName) setUserName(savedName);
                }
            } catch (err) {
                console.error("Unexpected error in fetchData:", err);
            }
        };

        fetchData();
    }, []);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            localStorage.removeItem("ebi_answers");
            localStorage.removeItem("ebi_user_name");
            window.location.href = "/login";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-mesh-gradient text-foreground" suppressHydrationWarning>
            <div className="px-6 py-8 pb-32">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Mi Perfil
                    </h1>
                </header>

                {/* Profile Card */}
                <div className="mb-6 rounded-[24px] glass-card p-8 animate-fadeIn">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 shadow-sm border border-white">
                            <User className="h-10 w-10 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                        {!isAuthenticated ? (
                            <a
                                href="/login"
                                className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-bold text-purple-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Iniciar Sesión
                            </a>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="mt-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 shadow-sm">
                                    {activeRole === 'super_admin' ? 'Super Admin' :
                                        activeRole === 'company_admin' ? 'Admin Empresa' : 'Usuario'}
                                </span>
                                {(userRoles.includes('super_admin') || userRoles.includes('company_admin')) && (
                                    <a
                                        href={activeRole === 'super_admin' ? "/admin/super" : "/admin/company"}
                                        className="mt-4 flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:scale-[1.03] active:scale-[0.98]"
                                    >
                                        Ir al Panel de Control <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-gray-50 p-4 text-center border border-gray-100">
                            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-purple-500" />
                            <p className="text-2xl font-bold text-gray-900">{diagnosticCount}</p>
                            <p className="text-xs text-gray-500">Diagnósticos</p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4 text-center border border-gray-100">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                            <p className="text-sm font-bold text-gray-900">
                                {mounted ? (lastDiagnostic !== "-" ? lastDiagnostic.split(" ")[0] : "-") : "-"}
                            </p>
                            <p className="text-xs text-gray-500">Último</p>
                        </div>
                    </div>

                    {/* Wellbeing Wheel Banner */}
                    <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7e22ce] to-[#3b82f6] p-6 text-white shadow-xl shadow-purple-200">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <h3 className="text-lg font-black uppercase tracking-tight italic">Rueda de Bienestar Bs360</h3>
                                <p className="text-xs font-bold text-white/80 max-w-xs">
                                    Realizá un check-in rápido y recibí recomendaciones de nuestra IA hoy.
                                </p>
                            </div>
                            <a
                                href="/wellbeing"
                                className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                IR A MI RUEDA
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/10 blur-3xl" />
                        <div className="absolute -top-6 -left-6 h-32 w-32 bg-white/10 blur-3xl" />
                    </div>
                </div>

                {/* Role Selection - Only show if user has multiple roles */}
                {isAuthenticated && userRoles.length > 1 && (
                    <div className="mb-6 space-y-4 animate-fadeIn" style={{ animationDelay: "0.05s" }}>
                        <div className="mb-3 px-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Mis Roles de Acceso
                            </h3>
                            <p className="text-sm text-gray-500">
                                Selecciona el rol con el que deseas trabajar
                            </p>
                        </div>

                        <div className="space-y-3">
                            {userRoles.includes('super_admin') && (
                                <RoleCard
                                    title="Super Administrador"
                                    description="Gestión global de todas las empresas"
                                    icon={<Settings className="h-6 w-6" />}
                                    role="super_admin"
                                    active={activeRole === 'super_admin'}
                                    href="/admin/super"
                                    bypassSwitch={true}
                                />
                            )}

                            {userRoles.includes('company_admin') && (
                                <RoleCard
                                    title="Administrador de Empresa"
                                    description={companyName ? `Gestión de ${companyName}` : "Gestión de empresa"}
                                    icon={<User className="h-6 w-6" />}
                                    role="company_admin"
                                    active={activeRole === 'company_admin'}
                                    href="/admin/company"
                                    bypassSwitch={false}
                                />
                            )}

                            {userRoles.includes('employee') && (
                                <RoleCard
                                    title="Empleado"
                                    description="Realizar diagnósticos y ver resultados"
                                    icon={<TrendingUp className="h-6 w-6" />}
                                    role="employee"
                                    active={activeRole === 'employee'}
                                    href="/diagnostico"
                                    bypassSwitch={false}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Achievements Section */}
                {achievements.length > 0 && (
                    <div className="mb-6 animate-fadeIn" style={{ animationDelay: "0.05s" }}>
                        <div className="mb-3 flex items-center space-x-2 px-1">
                            <Award className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Logros
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`rounded-2xl p-4 text-center transition-all border ${achievement.unlocked
                                        ? "bg-amber-50 border-amber-200"
                                        : "bg-gray-100 border-gray-200 grayscale opacity-60"
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <p className="text-xs font-bold text-gray-800 line-clamp-1">
                                        {achievement.title}
                                    </p>
                                    {achievement.unlocked && (
                                        <p className="text-[10px] text-gray-600 mt-1 line-clamp-2">
                                            {achievement.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                <div className="mb-6 space-y-3 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                    <h3 className="mb-3 px-1 text-lg font-semibold text-gray-900">
                        Configuración
                    </h3>

                    <div className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Settings className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-900">Notificaciones</span>
                        </div>
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-200 transition-all hover:bg-red-50 active:scale-[0.99]"
                    >
                        <div className="flex items-center space-x-3">
                            <LogOut className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-gray-900">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>

                {/* About */}
                <a
                    href="https://bs360.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl bg-gray-50 p-6 border border-gray-200 transition-all active:scale-98"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="mb-2 font-semibold text-gray-900">
                                Acerca de EBI 360
                            </h3>
                            <p className="text-sm text-gray-500">
                                Plataforma de diagnóstico integral para LATAM.
                            </p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                    </div>
                </a>
            </div>
        </div>
    );
}
