"use client";

import { UserCircle, Activity, Brain, Heart, Zap, Shield, Smile, Play, ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AppleDashboardProps {
    user: any;
    diagnosticData: any;
}

export function AppleDashboard({ user, diagnosticData }: AppleDashboardProps) {
    const hasData = !!diagnosticData;

    // Default empty scores
    const scores = {
        personal: hasData && diagnosticData.global_score ? diagnosticData.global_score.toFixed(1) : "-",
        org: hasData ? "8.6" : "-", // Still mock for org avg as we don't calculate it yet
    };

    // Calculate progress for "Connection" mock card if data exists
    const purposeScore = hasData && diagnosticData.domain_scores ? (diagnosticData.domain_scores["Emocional"] || 5) : 0;
    const purposePercentage = (purposeScore / 10) * 100;

    return (
        <div className="min-h-screen pb-32 bg-mesh-gradient text-foreground font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-2 flex justify-between items-center">
                <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Bienvenido</span>
                    <div className="relative h-8 w-32 mt-1">
                        <Image
                            src="/logo-bs360.png"
                            alt="Bienestar 360"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                    {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="Profile" width={40} height={40} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
                            <UserCircle className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </header>

            {/* Navigation Tabs (Scrollable) */}
            <div className="mt-4 px-6 flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear">
                {["Resumen", "Dimensiones", "Equipos", "Actividades", "Historial"].map((tab, i) => (
                    <button
                        key={tab}
                        className={`flex-none rounded-full px-5 py-2 text-sm font-medium transition-all ${i === 0
                            ? "bg-white text-black shadow-md"
                            : "bg-white/40 text-gray-600 hover:bg-white/60"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {!hasData ? (
                /* Empty State / Welcome */
                <div className="mt-8 px-6 animate-fadeIn">
                    <div className="glass-card rounded-[28px] p-8 text-center border-dashed border-2 border-brand-blue/30">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                            <Activity className="h-10 w-10 text-brand-blue" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-brand-dark">¡Hola, {user?.user_metadata?.full_name?.split(' ')[0] || "Bienvenido"}!</h2>
                        <p className="mb-8 text-sm text-gray-500">
                            Aún no has realizado tu primer diagnóstico. Descubre tu nivel de bienestar 360° en solo 5 minutos.
                        </p>
                        <Link
                            href="/diagnostico"
                            className="bg-brand-blue group flex w-full items-center justify-center rounded-2xl px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Comenzar Diagnóstico
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            ) : (
                /* Dashboard with Data */
                <div className="mt-8 px-6 grid grid-cols-2 gap-4 animate-fadeIn">
                    {/* Personal Score */}
                    <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between h-48 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">Índice<br />Personal</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">Tu resultado</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-5xl font-bold tracking-tighter text-brand-dark">{scores.personal}</span>
                        </div>
                        {/* decorative background blob */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-200/50 rounded-full blur-xl group-hover:bg-purple-300/60 transition-colors" />
                    </div>

                    {/* Organizational Score */}
                    <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between h-48 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">Factor<br />Organizacional</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">Media empresa</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-5xl font-bold tracking-tighter text-brand-dark">{scores.org}</span>
                        </div>
                        {/* decorative background blob */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/50 rounded-full blur-xl group-hover:bg-blue-300/60 transition-colors" />
                    </div>
                </div>
            )}

            {/* Action Card / Slider Area */}
            {hasData && (
                <div className="px-6 mt-6 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                    <div className="glass-panel rounded-[24px] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Conexión con el propósito</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${purposeScore >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {purposeScore >= 8 ? 'Alto' : 'Medio'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-gradient-to-r from-brand-blue to-brand-cyan h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${purposePercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Tu bienestar emocional es clave. {purposeScore < 8 ? "Hay oportunidades para mejorar tu conexión." : "¡Estás muy alineado con tu propósito!"}
                        </p>
                        <Link href="/resultados" className="mt-4 block w-full text-center text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline">
                            Ver Reporte Completo
                        </Link>
                    </div>
                </div>
            )}

            {/* Dimensions / Quick Actions Grid */}
            <div className="border-t border-black/5 mt-8 pt-8">
                <h3 className="px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Dimensiones</h3>
                <div className="px-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {[
                        { icon: Activity, color: "bg-purple-100 text-purple-600", label: "Física" },
                        { icon: Brain, color: "bg-blue-100 text-blue-600", label: "Mental" },
                        { icon: Heart, color: "bg-pink-100 text-pink-600", label: "Emocional" },
                        { icon: Shield, color: "bg-amber-100 text-amber-600", label: "Valores" },
                        { icon: Zap, color: "bg-teal-100 text-teal-600", label: "Energía" },
                        { icon: Smile, color: "bg-indigo-100 text-indigo-600", label: "Social" },
                    ].map((item, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-2 group min-w-[64px]">
                            <div className={`h-16 w-16 rounded-[20px] flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${item.color}`}>
                                <item.icon className="h-7 w-7" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
