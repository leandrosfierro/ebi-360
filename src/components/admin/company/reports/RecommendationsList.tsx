"use client";

import { Lightbulb, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCompanyRecommendations } from "@/lib/recommendations-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RecommendationsListProps {
    recommendations: any[];
    evaluationId: string;
    companyId: string;
}

export function RecommendationsList({ recommendations, evaluationId, companyId }: RecommendationsListProps) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateCompanyRecommendations(evaluationId, companyId);
            if (result.error) {
                alert("Error: " + result.error);
            } else {
                router.refresh();
            }
        } catch (error) {
            alert("Error al generar recomendaciones");
        } finally {
            setIsGenerating(false);
        }
    };

    if (recommendations.length === 0) {
        return (
            <div className="glass-card p-10 rounded-[32px] border-none shadow-xl text-center bg-primary/5">
                <Sparkles className="mx-auto h-12 w-12 text-primary/40 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Análisis de Inteligencia Artificial</h3>
                <p className="text-sm text-muted-foreground italic mb-6 max-w-md mx-auto">
                    Nuestra IA puede analizar los resultados agregados para detectar patrones y sugerir acciones concretas.
                </p>
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || evaluationId === "all"}
                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analizando Datos...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar Hallazgos con IA
                        </>
                    )}
                </Button>
                {evaluationId === "all" && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase mt-4 tracking-widest">
                        Selecciona una encuesta específica para analizar
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground italic uppercase">Hallazgos & Recomendaciones</h3>
                    <p className="text-sm text-muted-foreground italic">Sugerencias estratégicas basadas en el análisis de clima.</p>
                </div>
                {recommendations.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="text-primary hover:bg-primary/5 rounded-xl font-bold"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Actualizar Análisis
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="glass-card p-6 rounded-[24px] border border-white/10 hover:border-primary/20 transition-all relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${rec.priority === 'alta' ? 'bg-rose-500/10 text-rose-500' :
                                rec.priority === 'media' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            Prioridad {rec.priority}
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <Lightbulb className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-foreground">{rec.domain}</h4>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Nivel: {rec.recommendation_type}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 italic">
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    <strong className="text-primary not-italic block mb-1">Hallazgo:</strong>
                                    "{rec.finding_text}"
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    <strong className="text-emerald-500 block mb-1">Recomendación:</strong>
                                    {rec.recommendation_text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
