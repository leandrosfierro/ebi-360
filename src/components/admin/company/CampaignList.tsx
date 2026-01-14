"use client";

import Link from "next/link";
import { Campaign } from "@/lib/surveys/types";
import { ClipboardCheck, Calendar, Lock, Unlock, Loader2, FileText, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { closeEvaluation } from "@/lib/surveys/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface CampaignListProps {
    campaigns: any[]; // Extended campaign with survey info
}

export function CampaignList({ campaigns }: CampaignListProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleClose = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de cerrar la evaluación "${name}"? Esto congelará los resultados y generará el informe final.`)) return;

        setIsLoading(id);
        try {
            const result = await closeEvaluation(id);
            if (result.error) {
                alert("Error al cerrar: " + result.error);
            } else {
                router.refresh();
            }
        } catch (error) {
            alert("Error al cerrar la evaluación");
        } finally {
            setIsLoading(null);
        }
    };

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-20 glass-card rounded-[32px] border-none shadow-xl">
                <ClipboardCheck className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No hay evaluaciones asignadas</h3>
                <p className="text-sm text-muted-foreground italic">Contacta al administrador para habilitar nuevos módulos.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {campaigns.map((item) => {
                const campaign = item;
                const survey = item.survey;
                const isClosed = campaign.status === 'closed';

                return (
                    <div key={campaign.id} className="glass-card p-6 md:p-8 rounded-[32px] border border-white/10 hover:border-primary/20 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-[24px] shadow-inner transition-all ${isClosed ? 'bg-gray-500/10 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                                    <ClipboardCheck className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-black text-xl text-foreground italic uppercase tracking-tight">
                                            {survey?.name || "Evaluación"}
                                        </h4>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isClosed
                                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                            }`}>
                                            {isClosed ? 'Cerrada' : 'Abierta'}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium mb-4 max-w-xl">
                                        {survey?.description || "Sin descripción disponible."}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                            Asignada: {new Date(campaign.assigned_at).toLocaleDateString()}
                                        </div>
                                        {campaign.end_date && (
                                            <div className="flex items-center gap-1.5">
                                                <Lock className="h-3.5 w-3.5 text-rose-500/60" />
                                                Cerrada: {new Date(campaign.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-primary/60" />
                                            Umbral mín: {campaign.min_threshold || 5} respuestas
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 md:self-center">
                                {isClosed ? (
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold"
                                        asChild
                                    >
                                        <Link href={`/admin/company/reports?survey=${survey.id}`}>
                                            <FileText className="mr-2 h-4 w-4 text-primary" />
                                            Ver Informe Final
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleClose(campaign.id, survey.name)}
                                        disabled={isLoading === campaign.id}
                                        className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                                    >
                                        {isLoading === campaign.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Cerrando...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Cerrar Evaluación
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    className="rounded-2xl hover:bg-white/5 font-bold italic text-muted-foreground uppercase tracking-widest text-[10px]"
                                >
                                    Ver Detalle
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

