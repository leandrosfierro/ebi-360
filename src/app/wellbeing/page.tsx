"use client";

import { useState, useEffect } from "react";
import { WellbeingForm } from "@/components/wellbeing/WellbeingForm";
import { WellbeingDashboard } from "@/components/wellbeing/WellbeingDashboard";
import { WellbeingHistory } from "@/components/wellbeing/WellbeingHistory";
import {
    saveWellbeingCheckIn,
    getWellbeingHistory,
    getLatestWellbeingCheckIn,
    WellbeingCheckIn
} from "@/lib/wellbeing/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, History, PlusCircle, LayoutDashboard, Loader2, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WellbeingWheelPage() {
    const [view, setView] = useState<'checkin' | 'dashboard' | 'history'>('checkin');
    const [latestCheckIn, setLatestCheckIn] = useState<WellbeingCheckIn | null>(null);
    const [history, setHistory] = useState<WellbeingCheckIn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [latest, hist] = await Promise.all([
                getLatestWellbeingCheckIn(),
                getWellbeingHistory(90)
            ]);

            if (latest?.data) {
                setLatestCheckIn(latest.data);
                setView('dashboard');
            } else {
                setView('checkin');
            }

            if (hist?.data) {
                setHistory(hist.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (scores: Record<string, number>, note: string) => {
        setIsSaving(true);
        const result = await saveWellbeingCheckIn({ scores, note });
        if (result.success && result.data) {
            setLatestCheckIn(result.data);
            setHistory(prev => [result.data!, ...prev]);
            setView('dashboard');
        } else {
            alert("Error al guardar: " + result.error);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Cargando tu bienestar...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-foreground italic uppercase italic">Rueda de Bienestar</h2>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-xl text-sm italic">
                        Realizá tu check-in diario para entender cómo estás hoy y recibir recomendaciones personalizadas de Bs360.
                    </p>
                </div>

                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3 bg-white/40 border border-white/20 p-1 h-14 rounded-2xl">
                        <TabsTrigger value="checkin" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Check-in
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" disabled={!latestCheckIn} className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Resultado
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Historial
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'checkin' && (
                        <div className="space-y-8">
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl font-black uppercase italic tracking-tight italic">¿Cómo te sentís hoy?</h3>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Marcá del 1 al 10 cómo te ves en cada dominio</p>
                            </div>
                            <WellbeingForm onSave={handleSave} isLoading={isSaving} />
                        </div>
                    )}

                    {view === 'dashboard' && latestCheckIn && (
                        <WellbeingDashboard
                            checkIn={latestCheckIn}
                            onNewCheckIn={() => setView('checkin')}
                            onViewHistory={() => setView('history')}
                        />
                    )}

                    {view === 'history' && (
                        <WellbeingHistory
                            history={history}
                            onSelectDay={(item) => {
                                setLatestCheckIn(item);
                                setView('dashboard');
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
