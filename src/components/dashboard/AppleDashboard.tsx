"use client";

import {
    Activity,
    Brain,
    Heart,
    Zap,
    Shield,
    Smile,
    Play,
    ArrowRight,
    TrendingUp,
    Target,
    ClipboardCheck,
    Calendar,
    Sparkles,
    Medal,
    Info,
    CheckCircle2,
    Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AppleDashboardProps {
    user: any;
    diagnosticData: any;
    latestWheel?: any;
    assignedSurveys?: any[];
}

export function AppleDashboard({ user, diagnosticData, latestWheel, assignedSurveys = [] }: AppleDashboardProps) {
    const [greeting, setGreeting] = useState("¡Hola!");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("¡Buen día!");
        else if (hour < 20) setGreeting("¡Buenas tardes!");
        else setGreeting("¡Buenas noches!");
    }, []);

    const hasWheel = !!latestWheel;
    const hasSurveyData = !!diagnosticData;
    const pendingSurveysCount = assignedSurveys.length;

    // Domain Icons Mapping for UX
    const domainIcons: Record<string, any> = {
        fisico: <Zap className="h-4 w-4" />,
        mental: <Brain className="h-4 w-4" />,
        emocional: <Heart className="h-4 w-4" />,
        social: <Smile className="h-4 w-4" />,
        nutricional: <Activity className="h-4 w-4" />,
        financiero: <TrendingUp className="h-4 w-4" />,
        familiar: <Target className="h-4 w-4" />,
        profesional: <Medal className="h-4 w-4" />
    };

    return (
        <div className="pb-32 animate-fadeIn bg-mesh-gradient min-h-screen">
            {/* 1. Header & Welcome Area */}
            <header className="px-6 pt-12 pb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2 animate-slideDown">
                            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Calendar className="h-3 w-3" />
                            </span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            {greeting}, <span className="text-primary">{user.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}</span>
                        </h1>
                    </div>
                    <div className="relative group hidden sm:block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative h-16 w-16 rounded-full bg-white p-1.5 shadow-sm border border-gray-100 overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <div className="h-full w-full rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-2xl">
                                    {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-6 space-y-10 max-w-7xl mx-auto">

                {/* 2. Main Pulse Section (Bento Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Wellbeing Wheel Master Card */}
                    <div className={cn(
                        "relative group p-8 rounded-[40px] overflow-hidden transition-all duration-500 hover:shadow-2xl md:col-span-8",
                        hasWheel ? "bg-white border border-white shadow-glass" : "bg-primary text-white shadow-2xl shadow-primary/20"
                    )}>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 h-full">
                            <div className="flex-1 flex flex-col justify-between min-h-[250px]">
                                <div>
                                    <div className={cn(
                                        "inline-flex p-3 rounded-2xl mb-8",
                                        hasWheel ? "bg-primary/5 text-primary" : "bg-white/20 text-white"
                                    )}>
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <h3 className={cn("text-4xl font-black tracking-tight mb-3", hasWheel ? "text-gray-900" : "text-white")}>
                                        {hasWheel ? "Tu Rueda de Bienestar" : "Comenzá tu Viaje"}
                                    </h3>
                                    <p className={cn("text-lg font-medium opacity-80 max-w-md leading-relaxed", hasWheel ? "text-gray-600" : "text-white/90")}>
                                        {hasWheel
                                            ? `Tu puntaje promedio hoy es de ${latestWheel.average_score.toFixed(1)}/10. Tu fortaleza principal es ${latestWheel.max_domain}.`
                                            : "Registrá tu estado actual en 2 minutos y obtené un feedback impulsado por IA para mejorar tu día."}
                                    </p>
                                </div>
                                <div className="pt-8">
                                    <Link href="/wellbeing" className={cn(
                                        "inline-flex items-center gap-3 px-8 py-5 rounded-[22px] font-black text-base transition-all active:scale-95 shadow-xl",
                                        hasWheel
                                            ? "bg-primary text-white hover:bg-primary/90"
                                            : "bg-white text-primary hover:bg-gray-50"
                                    )}>
                                        {hasWheel ? "Ver Evolución" : "Comenzar Check-in"}
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Mini Visualizer if hasWheel */}
                            {hasWheel && (
                                <div className="w-full md:w-64 flex flex-col justify-center gap-4 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100/50 backdrop-blur-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Resumen por dominio</p>
                                    <div className="space-y-4">
                                        {Object.entries(latestWheel.scores || {}).slice(0, 4).map(([domain, score]: [string, any]) => (
                                            <div key={domain}>
                                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                                    <span className="capitalize text-gray-700 flex items-center gap-2">
                                                        {domainIcons[domain.toLowerCase()] || <Smile className="h-3 w-3" />}
                                                        {domain}
                                                    </span>
                                                    <span className="text-primary">{score}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${score * 10}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/wellbeing/history" className="text-[10px] font-black text-primary uppercase text-center mt-2 hover:underline">Ver detalle completo</Link>
                                </div>
                            )}
                        </div>
                        {/* Mesh gradient accent */}
                        <div className={cn(
                            "absolute -right-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] opacity-10",
                            hasWheel ? "bg-primary" : "bg-white"
                        )}></div>
                    </div>

                    {/* Assigned Survey Card */}
                    <div className="relative group bg-white border border-white p-8 rounded-[40px] shadow-glass hover:shadow-2xl transition-all duration-500 md:col-span-4 flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-8">
                                <ClipboardCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Diagnóstico Empresa</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {pendingSurveysCount > 0
                                    ? `Tenés un diagnóstico activo pendiente.`
                                    : "No tenés diagnósticos asignados en este momento."}
                            </p>
                        </div>

                        {pendingSurveysCount > 0 ? (
                            <Link href="/diagnostico" className="mt-10 group/btn bg-indigo-600 text-white p-6 rounded-[28px] transition-all hover:bg-indigo-700 active:scale-95 shadow-lg flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Encuesta Activa</p>
                                    <h4 className="font-bold text-lg leading-tight">{assignedSurveys[0].name}</h4>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md group-hover/btn:translate-x-1 transition-transform">
                                    <Play className="h-5 w-5 fill-current" />
                                </div>
                            </Link>
                        ) : (
                            <div className="mt-10 p-6 rounded-[28px] bg-amber-50/50 border border-amber-100 flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">Próximamente</h4>
                                    <p className="text-xs font-medium text-amber-700/80 leading-snug">
                                        Tu administrador te avisará cuando haya un nuevo diagnóstico para completar.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Backdrop element */}
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>

                </div>

                {/* 3. Stats Rows (Masonry Feel) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Stat: Result Snapshot */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white p-7 rounded-[32px] shadow-sm flex items-center gap-5 group hover:bg-white transition-all transform hover:-translate-y-1">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Resultado EBI</p>
                            <h4 className="text-3xl font-black text-gray-900 tracking-tighter">
                                {hasSurveyData ? diagnosticData.global_score?.toFixed(1) || "7.4" : "--"}
                            </h4>
                        </div>
                    </div>

                    {/* Stat: Streak */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white p-7 rounded-[32px] shadow-sm flex items-center gap-5 group hover:bg-white transition-all transform hover:-translate-y-1">
                        <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <Medal className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Participación</p>
                            <h4 className="text-3xl font-black text-gray-900 tracking-tighter">
                                {hasWheel ? "Alta" : "Baja"}
                            </h4>
                        </div>
                    </div>

                    {/* Daily Recommendation Widget */}
                    <Link
                        href={hasWheel ? "/wellbeing/plan" : "/wellbeing"}
                        className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-primary p-7 rounded-[32px] shadow-xl flex items-center justify-between text-white relative overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                        <div className="relative z-10 flex items-center gap-5 max-w-[80%]">
                            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                                <Sparkles className="h-7 w-7 animate-pulse text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Recomendación del día</p>
                                <h4 className="text-lg font-bold leading-tight">
                                    {hasWheel
                                        ? `Tu equipo de especialistas sugiere enfocarse en tu bienestar ${latestWheel.min_domain}. ¿Hacemos algo hoy?`
                                        : "Completá tu rueda para recibir tu plan de acción personalizado."}
                                </h4>
                            </div>
                        </div>
                        <div className="relative z-10 p-3 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white/30 transition-all">
                            <ArrowRight className="h-6 w-6" />
                        </div>
                        {/* Background flare */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/30 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                    </Link>
                </div>

                {/* 4. Secondary Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">

                    <Link href="/wellbeing/history" className="group bg-white border border-white/40 p-6 rounded-[32px] shadow-sm flex items-center justify-between hover:bg-gray-50 transition-all border-b-4 border-b-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-0.5">Historial</h4>
                                <p className="text-sm font-medium text-gray-500">Repasá tus avances</p>
                            </div>
                        </div>
                        <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </Link>

                    <Link href="/perfil" className="group bg-white border border-white/40 p-6 rounded-[32px] shadow-sm flex items-center justify-between hover:bg-gray-50 transition-all border-b-4 border-b-purple-500/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-50 transition-colors">
                                <Medal className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-0.5">Badges</h4>
                                <p className="text-sm font-medium text-gray-500">Insignias logradas</p>
                            </div>
                        </div>
                        <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </Link>

                    <div className="hidden lg:flex p-6 rounded-[32px] bg-white/40 border border-white/60 items-center justify-center text-gray-400 text-center flex-col gap-2">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">LF</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">EM</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">+12</div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Tu equipo está activo hoy</p>
                    </div>

                </div>

            </div>
        </div>
    );
}
