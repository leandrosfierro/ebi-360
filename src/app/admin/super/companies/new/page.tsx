"use client";

import { createCompany } from "@/lib/actions";
import { ArrowLeft, Building2, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCompanyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await createCompany(formData);

        if (result.success) {
            router.push("/admin/super/companies");
            router.refresh();
        } else {
            alert("Error al crear la empresa");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/super/companies"
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nueva Empresa</h2>
                    <p className="text-gray-500">Registra una nueva organización en la plataforma.</p>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nombre de la Empresa
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="Ej. Tech Solutions SA"
                                className="w-full rounded-lg border border-gray-200 pl-10 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Subscription Plan */}
                    <div className="space-y-2">
                        <label htmlFor="plan" className="text-sm font-medium text-gray-700">
                            Plan de Suscripción
                        </label>
                        <select
                            id="plan"
                            name="plan"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                        >
                            <option value="basic">Basic (Hasta 50 usuarios)</option>
                            <option value="pro">Pro (Hasta 200 usuarios)</option>
                            <option value="enterprise">Enterprise (Ilimitado)</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                        <input
                            id="active"
                            name="active"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">
                            Empresa Activa
                            <p className="text-xs font-normal text-gray-500">
                                Las empresas inactivas no pueden acceder a la plataforma.
                            </p>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link
                            href="/admin/super/companies"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Guardar Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
