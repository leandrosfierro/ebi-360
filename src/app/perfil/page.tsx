"use client";

import { useState, useEffect } from "react";
import { User, Calendar, TrendingUp, Settings, LogOut, ExternalLink, Award } from "lucide-react";
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
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setIsAuthenticated(true);
                // Fetch from DB with roles
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

                if (profile?.role) {
                    setUserRole(profile.role);
                }

                if (profile?.roles) {
                    setUserRoles(profile.roles);
                }

                if (profile?.active_role) {
                    setActiveRole(profile.active_role);
                }

                if (profile?.company && typeof profile.company === 'object' && 'name' in profile.company) {
                    setCompanyName((profile.company as any).name);
                }

                if (profile?.full_name) {
                    setUserName(profile.full_name);
                }

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

                    // Calculate achievements based on latest result
                    const latest = results[0];
                    const unlockedAchievements = checkAchievements({
                        diagnosticCount: results.length,
                        globalScore: Number(latest.global_score),
                        scores: latest.domain_scores,
                    });
                    setAchievements(unlockedAchievements);
                }
            } else {
                // Fallback to Local Storage
                const saved = localStorage.getItem("ebi_answers");
                if (saved) {
                    setDiagnosticCount(1);
                    const date = new Date().toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                    setLastDiagnostic(date);

                    const answers = JSON.parse(saved);
                    // Simplified score calculation for achievements (mock for local)
                    const globalScore = 7.5;
                    const scores = {
                        "Físico": 8, "Nutricional": 7, "Emocional": 9,
                        "Social": 6, "Familiar": 8, "Económico": 7,
                    };

                    const unlockedAchievements = checkAchievements({
                        diagnosticCount: 1,
                        globalScore,
                        scores,
                    });
                    setAchievements(unlockedAchievements);
                }

                const savedName = localStorage.getItem("ebi_user_name");
                if (savedName) {
                    setUserName(savedName);
                }
            }
        };

        fetchData();
    }, []);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleNameChange = () => {
        const newName = prompt("Ingresa tu nombre:", userName);
        if (newName && newName.trim()) {
            setUserName(newName.trim());
            localStorage.setItem("ebi_user_name", newName.trim());
        }
    };

    const handleSignOut = async () => {
        // Optional: Simple confirmation or just sign out. 
        // For better UX, we can just sign out without popup, or a gentle one.
        // Given user request, we'll remove the scary "delete data" part.

        try {
            const supabase = createClient();
            await supabase.auth.signOut();

            // Clear local session artifacts silently
            localStorage.removeItem("ebi_answers");
            localStorage.removeItem("ebi_user_name");

            // Redirect to home or login
            window.location.href = "/login";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-mesh-gradient text-foreground" suppressHydrationWarning>
            <div className="px-6 py-8 pb-32">
                <header className="mb-8">
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
                                <span className="mt-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                    {activeRole === 'super_admin' ? 'Super Admin' :
                                        activeRole === 'company_admin' ? 'Admin Empresa' :
                                            userRole === 'super_admin' ? 'Super Admin' :
                                                userRole === 'company_admin' ? 'Admin Empresa' : 'Usuario'}
                                </span>
                                {((activeRole === 'super_admin' || activeRole === 'company_admin') ||
                                    (userRole === 'super_admin' || userRole === 'company_admin')) && (
                                        <a
                                            href={
                                                (activeRole === 'super_admin' || (!activeRole && userRole === 'super_admin'))
                                                    ? "/admin/super"
                                                    : "/admin/company"
                                            }
                                            className="mt-3 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                                        >
                                            Ir al Panel Admin <ExternalLink className="h-3 w-3" />
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
                        <p className="mt-3 text-center text-xs text-gray-500">
                            {achievements.filter(a => a.unlocked).length} de {achievements.length} desbloqueados
                        </p>
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
                    <p className="mt-4 text-xs text-gray-400">
                        Versión 1.0.0
                    </p>
                </a>
            </div>
        </div>
    );
}
