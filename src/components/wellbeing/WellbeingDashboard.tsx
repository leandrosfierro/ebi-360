"use client";

import { motion } from "framer-motion";
import { WellbeingRadar } from "./WellbeingRadar";
import { WellbeingCheckIn } from "@/lib/wellbeing/actions";
import { DOMAIN_LABELS } from "@/lib/wellbeing/constants";
import { ArrowUpCircle, ArrowDownCircle, Sparkles, History, PlusCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WellbeingDashboardProps {
    checkIn: WellbeingCheckIn;
    onNewCheckIn: () => void;
    onViewHistory: () => void;
}

export function WellbeingDashboard({ checkIn, onNewCheckIn, onViewHistory }: WellbeingDashboardProps) {
    const feedback = checkIn.ai_feedback;

    const scoresSorted = Object.entries(checkIn.scores).sort((a, b) => b[1] - a[1]);
    const strengths = scoresSorted.slice(0, 2);
    const priorities = scoresSorted.slice(-2).reverse();

    return (
        <div className="space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Stats and Radar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7 space-y-8"
                >
                    <div className="glass-card p-8 md:p-12 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden bg-white/40">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Estado de Bienestar</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl sm:text-6xl md:text-7xl font-black text-primary italic tracking-tighter">
                                        {checkIn.average_score.toFixed(1)}
                                    </span>
                                    <span className="text-lg md:text-xl font-bold text-muted-foreground uppercase tracking-widest">Promedio</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={onViewHistory}
                                    className="rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 px-6 py-6"
                                >
                                    <History className="mr-2 h-5 w-5" /> Ver Historial
                                </Button>
                                <Button
                                    onClick={onNewCheckIn}
                                    className="rounded-2xl bg-primary hover:bg-primary/90 text-white px-6 py-6 shadow-xl shadow-primary/20"
                                >
                                    <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Check-in
                                </Button>
                            </div>
                        </div>

                        <WellbeingRadar scores={checkIn.scores} />

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 mt-8">
                            {Object.entries(checkIn.scores).map(([domain, score]) => (
                                <div key={domain} className="bg-white/5 rounded-2xl p-2 sm:p-3 border border-white/5 flex flex-col items-center">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground text-center line-clamp-1">{DOMAIN_LABELS[domain]}</span>
                                    <span className="text-lg sm:text-xl font-black text-primary italic">{score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths and Priorities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-[32px] border border-white/10 bg-emerald-500/5">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">
                                <ArrowUpCircle className="h-4 w-4" /> Fortalezas del día
                            </h4>
                            <div className="space-y-3">
                                {strengths.map(([domain, score]) => (
                                    <div key={domain} className="flex items-center justify-between bg-white/20 rounded-2xl p-4">
                                        <span className="font-bold text-sm">{DOMAIN_LABELS[domain]}</span>
                                        <span className="text-lg font-black text-emerald-600">{score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-[32px] border border-white/10 bg-rose-500/5">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-600 mb-4">
                                <ArrowDownCircle className="h-4 w-4" /> Prioridades del día
                            </h4>
                            <div className="space-y-3">
                                {priorities.map(([domain, score]) => (
                                    <div key={domain} className="flex items-center justify-between bg-white/20 rounded-2xl p-4">
                                        <span className="font-bold text-sm">{DOMAIN_LABELS[domain]}</span>
                                        <span className="text-lg font-black text-rose-600">{score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* AI Feedback */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5 space-y-6"
                >
                    <div className="glass-card p-8 md:p-10 rounded-[48px] border border-white/10 shadow-2xl bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-8">
                            <Sparkles className="h-12 w-12 text-primary/20 animate-pulse" />
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/20 p-2 rounded-xl">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tight italic uppercase">Feedback Bs360</h3>
                        </div>

                        {feedback ? (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-lg text-foreground/80 leading-relaxed font-medium">
                                        {feedback.summary}
                                    </p>
                                </div>

                                {feedback.priorities && feedback.priorities.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Foco hoy:</h4>
                                        {feedback.priorities.map((p: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-sm font-bold text-foreground/70 bg-white/30 p-4 rounded-2xl border border-white/20">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                <span>{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {feedback.actions && feedback.actions.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Acciones Micro:</h4>
                                        <div className="space-y-3">
                                            {feedback.actions[0]?.microActions?.map((action: string, i: number) => (
                                                <div key={i} className="bg-white/40 p-5 rounded-[24px] border border-white/20 shadow-sm transition-hover hover:bg-white/60">
                                                    <span className="text-sm font-bold block">{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-primary/10">
                                    <p className="text-[11px] text-primary font-black uppercase tracking-widest italic">
                                        ✨ {feedback.nextCheckIn}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground italic">Procesando tu feedback personalizado...</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
