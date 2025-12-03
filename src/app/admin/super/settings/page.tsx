"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/lib/actions";
import { Loader2, Save, Shield, Server, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function SuperAdminSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);
                }
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setMessage(null);

        const result = await updateProfile(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h2>
                <p className="text-gray-500">Administra tu perfil y la configuración global del sistema.</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        <CardTitle>Perfil de Administrador</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                Nombre Completo
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                defaultValue={userProfile?.full_name || ""}
                                placeholder="Tu nombre"
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email (No editable)
                            </label>
                            <input
                                type="email"
                                value={userProfile?.email || ""}
                                disabled
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* System Settings (Placeholder for now) */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-600" />
                        <CardTitle>Configuración del Sistema</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div>
                            <h4 className="font-medium text-gray-900">Modo Mantenimiento</h4>
                            <p className="text-sm text-gray-500">Desactiva el acceso a la plataforma para usuarios no administradores.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Próximamente</span>
                            {/* Toggle switch placeholder */}
                            <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-not-allowed">
                                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div>
                            <h4 className="font-medium text-gray-900">Registro de Usuarios</h4>
                            <p className="text-sm text-gray-500">Permitir nuevos registros públicos (actualmente solo por invitación).</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">Desactivado</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">Estas acciones son irreversibles o pueden afectar el rendimiento del sistema.</p>
                    <button
                        disabled
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-red-200 bg-white hover:bg-red-50 text-red-600 h-10 px-4 py-2 opacity-50 cursor-not-allowed"
                    >
                        Limpiar Caché del Sistema
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
