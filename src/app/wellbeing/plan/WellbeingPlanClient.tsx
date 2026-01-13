"use client";

import { useRef, useState } from "react";
import {
    ArrowLeft,
    Download,
    Sparkles,
    Zap,
    Brain,
    Activity,
    Heart,
    TrendingUp,
    Target,
    Medal,
    Users,
    ChevronRight,
    CheckCircle2,
    Calendar,
    Quote,
    RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WellbeingCheckIn, regenerateWellbeingPlan } from "@/lib/wellbeing/actions";
import { useRouter } from "next/navigation";

interface WellbeingPlanClientProps {
    latestCheckIn: WellbeingCheckIn;
    history: WellbeingCheckIn[];
}

export function WellbeingPlanClient({ latestCheckIn, history }: WellbeingPlanClientProps) {
    const router = useRouter();
    const [exporting, setExporting] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const feedback = latestCheckIn.ai_feedback || {};

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const res = await regenerateWellbeingPlan(latestCheckIn.id);
            if (res.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRegenerating(false);
        }
    };

    const domainIcons: Record<string, any> = {
        fisico: <Zap className="h-6 w-6" />,
        mental: <Brain className="h-6 w-6" />,
        emocional: <Heart className="h-6 w-6" />,
        social: <Users className="h-6 w-6" />,
        nutricional: <Activity className="h-6 w-6" />,
        financiero: <TrendingUp className="h-6 w-6" />,
        familiar: <Target className="h-6 w-6" />,
        profesional: <Medal className="h-6 w-6" />
    };

    const domainColors: Record<string, string> = {
        fisico: "from-orange-500 to-amber-500",
        mental: "from-purple-500 to-indigo-500",
        emocional: "from-rose-500 to-pink-500",
        social: "from-sky-500 to-blue-500",
        nutricional: "from-emerald-500 to-teal-500",
        financiero: "from-blue-600 to-indigo-600",
        familiar: "from-violet-500 to-purple-500",
        profesional: "from-cyan-500 to-blue-500"
    };

    // Normalize legacy structure if needed
    const actions = feedback.specializedActions || feedback.actions?.map((a: any) => ({
        domain: a.domain,
        role: "Especialista Bs360",
        technicalObservation: a.message,
        actionPlan: a.microActions || [],
        focus: a.score <= 4 ? "Crisis" : a.score <= 7 ? "Mejora" : "Mantenimiento"
    })) || [];

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const jsPDF = (await import("jspdf")).default;
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Branding Colors
            const primaryColor = [15, 23, 42]; // Slate 900
            const accentColor = [14, 165, 233]; // Sky 500

            // Header
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.rect(0, 0, 210, 40, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.text("PLAN DE ACCIÓN DIARIO", 20, 20);

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Generado el ${new Date().toLocaleDateString()}`, 20, 28);
            pdf.text("Equipo de Especialistas Bs360", 20, 33);

            let y = 55;

            // Summary
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Resumen Ejecutivo", 20, y);
            y += 8;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const summaryLines = pdf.splitTextToSize(feedback.summary || "Tu plan de bienestar personalizado para hoy.", 170);
            pdf.text(summaryLines, 20, y);
            y += (summaryLines.length * 5) + 10;

            // Specialized Actions
            actions.forEach((action: any) => {
                if (y > 250) {
                    pdf.addPage();
                    y = 20;
                }

                pdf.setFillColor(248, 250, 252); // Slate 50
                pdf.roundedRect(15, y, 180, 45, 3, 3, 'F');

                pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                pdf.setFontSize(11);
                pdf.setFont("helvetica", "bold");
                pdf.text(`${action.domain.toUpperCase()} - ${action.role}`, 20, y + 8);

                pdf.setTextColor(51, 65, 85); // Slate 700
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "italic");
                pdf.text(`OBS: ${action.technicalObservation}`, 20, y + 15);

                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                y += 22;
                action.actionPlan.forEach((step: string, i: number) => {
                    pdf.text(`• ${step}`, 25, y + (i * 5));
                });

                y += (action.actionPlan.length * 5) + 15;
            });

            // Mantra
            if (feedback.dailyMantra) {
                if (y > 270) pdf.addPage(), y = 20;
                pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
                pdf.rect(0, 280, 210, 17, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bolditalic");
                pdf.text(feedback.dailyMantra, 105, 290, { align: "center" });
            }

            pdf.save(`Plan-Bienestar-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Header Sticky */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Plan de Acción Hoy</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(latestCheckIn.created_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCcw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                            {regenerating ? "Actualizando..." : "Actualizar Plan"}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {exporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {exporting ? "Generando..." : "Exportar PDF"}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
                {/* Hero Section */}
                <section className="bg-slate-900 rounded-[48px] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-8">
                            <Sparkles className="h-4 w-4 text-sky-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-sky-200">Recomendación del día</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
                            {feedback.planTitle || "Tu mapa de bienestar para hoy"}
                        </h2>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8">
                            {feedback.summary || "Nuestro equipo de especialistas ha analizado tu estado actual para ofrecerte un camino claro hacia tu mejor versión."}
                        </p>
                        {feedback.dailyMantra && (
                            <div className="flex items-start gap-4 p-6 rounded-[32px] bg-white/5 border border-white/10 italic">
                                <Quote className="h-8 w-8 text-white/20 shrink-0" />
                                <p className="text-xl font-medium text-slate-200">{feedback.dailyMantra}</p>
                            </div>
                        )}
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
                </section>

                {/* Trend Analysis if history exceeds 3 */}
                {history.length >= 3 && feedback.trendAnalysis && (
                    <section className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-[24px] bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Análisis de Evolución</h3>
                            <p className="text-emerald-900/80 font-medium leading-relaxed">
                                {feedback.trendAnalysis}
                            </p>
                        </div>
                    </section>
                )}

                {/* Specialist Actions Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actions.length > 0 ? actions.map((action: any, idx: number) => (
                        <div
                            key={idx}
                            className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm hover:shadow-md transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn(
                                    "h-14 w-14 rounded-[22px] bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                                    domainColors[action.domain.toLowerCase()] || "from-slate-700 to-slate-900"
                                )}>
                                    {domainIcons[action.domain.toLowerCase()] || <Medal className="h-6 w-6" />}
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    action.focus === "Mejora" ? "bg-amber-100 text-amber-700" :
                                        action.focus === "Crisis" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                )}>
                                    {action.focus}
                                </span>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{action.role}</h4>
                                <h3 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{action.domain}</h3>
                            </div>

                            <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 mb-8 italic">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    "{action.technicalObservation}"
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                {action.actionPlan.map((step: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <p className="text-slate-700 font-medium leading-snug pt-0.5">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-[48px] p-20 text-center">
                            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">Análisis Detallado Pendiente</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                Tu plan aún no tiene el desglose por especialistas. Hacé clic en "Actualizar Plan" para generarlo ahora.
                            </p>
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[22px] font-black text-sm active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                            >
                                <RefreshCcw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                                {regenerating ? "Procesando..." : "Generar Plan Ahora"}
                            </button>
                        </div>
                    )}
                </section>

                {/* Footer Insight */}
                <footer className="bg-slate-50 rounded-[48px] p-10 text-center border border-slate-200">
                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Este plan fue diseñado por el equipo interdisciplinario de Bs360.
                        Recordá que pequeños cambios consistentes generan grandes transformaciones a largo plazo.
                        ¡Nos vemos en tu próximo check-in!
                    </p>
                </footer>
            </main>
        </div>
    );
}
