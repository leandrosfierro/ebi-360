"use client";

import { useState, useEffect } from "react";
import { User, Calendar, TrendingUp, Settings, LogOut, ExternalLink, Award } from "lucide-react";
import { checkAchievements, type Achievement } from "@/lib/achievements";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const [userName, setUserName] = useState("Usuario");
    const [diagnosticCount, setDiagnosticCount] = useState(0);
    const [lastDiagnostic, setLastDiagnostic] = useState<string>("-");
    const [mounted, setMounted] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setIsAuthenticated(true);
                // Fetch from DB
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", user.id)
                    .single();

                if (profile?.role) {
                    setUserRole(profile.role);
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

    const handleClearData = async () => {
        if (confirm("¿Estás seguro de que quieres cerrar sesión y borrar datos locales?")) {
            const supabase = createClient();
            await supabase.auth.signOut();

            localStorage.removeItem("ebi_answers");
            localStorage.removeItem("ebi_user_name");
            setDiagnosticCount(0);
            setLastDiagnostic("-");
            setUserName("Usuario");
            setIsAuthenticated(false);
            setUserRole(null);
            window.location.reload();
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-gradient-mockup" suppressHydrationWarning>
            <div className="px-6 py-8 pb-24">
                <h1 className="mb-8 text-2xl font-bold text-white drop-shadow-lg">
                    Mi Perfil
                </h1>

                {/* Profile Card */}
                <div className="mb-6 rounded-3xl bg-white/15 p-8 shadow-glass backdrop-blur-md border border-white/20 animate-fadeIn">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                            <User className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white drop-shadow">{userName}</h2>

                        {!isAuthenticated ? (
                            <a
                                href="/login"
                                className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-bold text-purple-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Iniciar Sesión
                            </a>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="mt-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white">
                                    {userRole === 'super_admin' ? 'Super Admin' :
                                        userRole === 'company_admin' ? 'Admin Empresa' : 'Usuario'}
                                </span>
                                {(userRole === 'super_admin' || userRole === 'company_admin') && (
                                    <a
                                        href={userRole === 'super_admin' ? "/admin/super" : "/admin/company"}
                                        className="mt-3 flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4 hover:text-white/80"
                                    >
                                        Ir al Panel Admin <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
                            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-white" />
                            <p className="text-2xl font-bold text-white drop-shadow">{diagnosticCount}</p>
                            <p className="text-xs text-white/80">Diagnósticos</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-white" />
                            <p className="text-sm font-bold text-white drop-shadow">
                                {mounted ? (lastDiagnostic !== "-" ? lastDiagnostic.split(" ")[0] : "-") : "-"}
                            </p>
                            <p className="text-xs text-white/80">Último</p>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                {achievements.length > 0 && (
                    <div className="mb-6 animate-fadeIn" style={{ animationDelay: "0.05s" }}>
                        <div className="mb-3 flex items-center space-x-2">
                            <Award className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white drop-shadow">
                                Logros
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`rounded-2xl p-4 text-center transition-all ${achievement.unlocked
                                        ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50 scale-100"
                                        : "bg-white/5 border border-white/10 opacity-50 grayscale"
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <p className="text-xs font-bold text-white drop-shadow line-clamp-1">
                                        {achievement.title}
                                    </p>
                                    {achievement.unlocked && (
                                        <p className="text-[10px] text-white/70 mt-1 line-clamp-2">
                                            {achievement.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-center text-xs text-white/60">
                            {achievements.filter(a => a.unlocked).length} de {achievements.length} desbloqueados
                        </p>
                    </div>
                )}

                {/* Settings Section */}
                <div className="mb-6 space-y-3 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                    <h3 className="mb-3 text-lg font-semibold text-white drop-shadow">
                        Configuración
                    </h3>

                    <div className="flex w-full items-center justify-between rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 transition-all hover:bg-white/20">
                        <div className="flex items-center space-x-3">
                            <Settings className="h-5 w-5 text-white" />
                            <span className="font-semibold text-white drop-shadow">Notificaciones</span>
                        </div>
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-400' : 'bg-white/20'}`}
                        >
                            <span
                                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    <button
                        onClick={handleClearData}
                        className="flex w-full items-center justify-between rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 transition-all hover:bg-red-500/30 active:scale-[0.99]"
                    >
                        <div className="flex items-center space-x-3">
                            <LogOut className="h-5 w-5 text-white" />
                            <span className="font-semibold text-white drop-shadow">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>

                {/* About */}
                <a
                    href="https://bs360.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 active:scale-98"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="mb-2 font-semibold text-white drop-shadow">
                                Acerca de Bienestar 360°
                            </h3>
                            <p className="text-sm text-white/80">
                                Visita nuestro sitio web oficial para más información.
                            </p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-white/60" />
                    </div>
                    <p className="mt-4 text-xs text-white/60">
                        Versión 1.0.0
                    </p>
                </a>
            </div>
        </div>
    );
}
