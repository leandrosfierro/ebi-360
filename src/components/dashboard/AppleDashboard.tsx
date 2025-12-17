"use client";

import { UserCircle, Activity, Brain, Heart, Zap, Shield, Smile } from "lucide-react";
import Image from "next/image";

export function AppleDashboard({ user }: { user: any }) {
    // Mock data based on image
    const scores = {
        personal: 7.8,
        org: 8.6
    };

    return (
        <div className="min-h-screen pb-32 bg-mesh-gradient text-foreground font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-2 flex justify-between items-center">
                <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Bienvenido</span>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienestar 360°</h1>
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

            {/* Score Cards */}
            <div className="mt-8 px-6 grid grid-cols-2 gap-4">
                {/* Personal Score */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between h-48 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">Responsabilidad<br />Personal</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">Último mes</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-5xl font-bold tracking-tighter text-gray-900">{scores.personal}</span>
                    </div>
                    {/* decorative background blob */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-200/50 rounded-full blur-xl group-hover:bg-purple-300/60 transition-colors" />
                </div>

                {/* Organizational Score */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between h-48 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">Factor<br />Organizacional</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">Promedio empresa</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-5xl font-bold tracking-tighter text-gray-900">{scores.org}</span>
                    </div>
                    {/* decorative background blob */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/50 rounded-full blur-xl group-hover:bg-blue-300/60 transition-colors" />
                </div>
            </div>

            {/* Action Card / Slider Area */}
            <div className="px-6 mt-6">
                <div className="glass-panel rounded-[24px] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Conexión con el propósito</h3>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Alto</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-[85%]" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Tu sentido de propósito ha aumentado un 12% respecto al mes anterior. ¡Sigue así!
                    </p>
                </div>
            </div>

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
