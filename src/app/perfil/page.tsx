"use client";

import { useState, useEffect } from "react";
import { User, Calendar, TrendingUp, Settings, LogOut, ExternalLink } from "lucide-react";

export default function ProfilePage() {
    const [userName, setUserName] = useState("Usuario");
    const [diagnosticCount, setDiagnosticCount] = useState(0);
    const [lastDiagnostic, setLastDiagnostic] = useState<string>("-");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if there are saved answers
        const saved = localStorage.getItem("ebi_answers");
        if (saved) {
            setDiagnosticCount(1);
            const date = new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            setLastDiagnostic(date);
        }

        // Check for saved user name
        const savedName = localStorage.getItem("ebi_user_name");
        if (savedName) {
            setUserName(savedName);
        }
    }, []);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleNameChange = () => {
        const newName = prompt("Ingresa tu nombre:", userName);
        if (newName && newName.trim()) {
            setUserName(newName.trim());
            localStorage.setItem("ebi_user_name", newName.trim());
        }
    };

    const handleClearData = () => {
        if (confirm("¿Estás seguro de que quieres borrar todos tus datos?")) {
            localStorage.removeItem("ebi_answers");
            localStorage.removeItem("ebi_user_name");
            setDiagnosticCount(0);
            setLastDiagnostic("-");
            setUserName("Usuario");
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
                        <button
                            onClick={handleNameChange}
                            className="mt-2 text-sm text-white/80 hover:text-white transition-colors"
                        >
                            Editar nombre
                        </button>
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
                            <span className="font-semibold text-white drop-shadow">Borrar todos los datos</span>
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
