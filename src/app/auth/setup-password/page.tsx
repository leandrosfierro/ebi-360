"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SetupPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setUserProfile(profile);
        };
        checkUser();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Update Auth Password
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });

            if (authError) throw authError;

            // 2. Update Profile status to 'active'
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    admin_status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq("id", userProfile?.id);

            if (profileError) {
                // Even if profile fails to update status, password is set. 
                // But we want to know.
                console.error("Profile update error:", profileError);
            }

            setIsSuccess(true);
            setTimeout(() => {
                const target = userProfile?.role === 'super_admin' ? '/admin/super' :
                    userProfile?.role === 'company_admin' ? '/admin/company' : '/perfil';
                router.push(target);
            }, 2000);

        } catch (err: any) {
            console.error("Setup password error:", err);
            setError(err.message || "Error al configurar la contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-mesh-gradient">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-mesh-gradient p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md space-y-8 rounded-[32px] bg-white/40 p-10 shadow-glass backdrop-blur-xl border border-white/40 animate-fadeIn relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl rotate-3">
                        <Image src="/logo.png" alt="Logo" width={50} height={50} className="object-contain" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900">
                        {isSuccess ? "¡Todo listo!" : "Configura tu cuenta"}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 mb-4 px-4">
                        {isSuccess
                            ? "Tu contraseña ha sido guardada. Redirigiendo..."
                            : `Hola ${userProfile.full_name?.split(' ')[0] || 'bienvenido'}, define tu contraseña para acceder a la plataforma.`}
                    </p>
                </div>

                {isSuccess ? (
                    <div className="flex justify-center py-10 animate-bounce">
                        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nueva Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                                    <input
                                        type="password"
                                        placeholder="Min. 6 caracteres"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/50 border-white/40 border p-4 pl-12 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                                    <input
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/50 border-white/40 border p-4 pl-12 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-2xl text-xs font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black p-5 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Comenzar ahora
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
