"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, ArrowRight, Chrome } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { Suspense } from "react";

function LoginFormContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup" | "google">("google");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/perfil";

    // Handle initial error from URL if any
    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === 'auth_failed') {
            setError("La autenticación falló. Por favor intenta de nuevo.");
        }
    }, [searchParams]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
                : `${window.location.origin}/auth/callback`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            console.error("Error logging in with Google:", error);
            setError(error.message || "Error al iniciar sesión con Google.");
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (authMode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                alert("Registro exitoso. Por favor revisa tu email para confirmar tu cuenta.");
                setAuthMode("login");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // After successful login, redirect to auth callback to sync profile
                router.push(`/auth/callback?next=${encodeURIComponent(nextPath)}`);
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            setError(error.message || "Error en la autenticación.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-mesh-gradient p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md space-y-8 rounded-[32px] bg-white/40 p-8 shadow-glass backdrop-blur-xl border border-white/40 animate-fadeIn relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl rotate-3 transition-transform hover:rotate-0">
                        <Image
                            src="/logo.png"
                            alt="EBI 360 Logo"
                            width={50}
                            height={50}
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900">
                        EBI 360
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        Diagnóstico de Bienestar Integral
                    </p>
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1 bg-gray-200/50 rounded-2xl mb-2">
                    <button
                        onClick={() => setAuthMode("google")}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                            authMode === "google" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Google
                    </button>
                    <button
                        onClick={() => setAuthMode("login")}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                            authMode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setAuthMode("signup")}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                            authMode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Registro
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-2xl text-xs font-bold animate-shake">
                        {error}
                    </div>
                )}

                {authMode === "google" ? (
                    /* Google Login Button */
                    <div className="space-y-4 py-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="group relative flex w-full items-center justify-center gap-4 rounded-[20px] bg-white px-4 py-5 font-bold text-gray-700 shadow-xl transition-all hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 border border-transparent hover:border-purple-200"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                            ) : (
                                <Chrome className="h-6 w-6 text-purple-600" />
                            )}
                            <span className="text-base">
                                {isLoading ? "Redirigiendo..." : "Continuar con Google"}
                            </span>
                        </button>
                        <p className="text-center text-xs text-gray-400 px-8">
                            Recomendado para acceder rápidamente con tu cuenta corporativa.
                        </p>
                    </div>
                ) : (
                    /* Email/Password Form */
                    <form onSubmit={handleEmailAuth} className="space-y-4 animate-slideIn">
                        {authMode === "signup" && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nombre Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                                    <input
                                        type="text"
                                        placeholder="Ej. Leandro Fierro"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white/50 border-white/40 border p-4 pl-12 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                                <input
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 border-white/40 border p-4 pl-12 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border-white/40 border p-4 pl-12 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black p-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {authMode === "login" ? "Entrar" : "Crear Cuenta"}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="pt-4 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                        Al continuar, aceptas nuestros <span className="text-gray-600 font-bold underline cursor-pointer">términos</span> y <span className="text-gray-600 font-bold underline cursor-pointer">privacidad</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center bg-mesh-gradient p-4">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    );
}
