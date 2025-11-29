"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { questions, domains, calculateScore } from "@/lib/logic";
import { cn } from "@/lib/utils";
import { RefreshCcw, Activity, Apple, Heart, Users, Home as HomeIcon, DollarSign, Share2, Lightbulb } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { getRecommendations } from "@/lib/achievements";

const domainIcons: Record<string, any> = {
    "Físico": Activity,
    "Nutricional": Apple,
    "Emocional": Heart,
    "Social": Users,
    "Familiar": HomeIcon,
    "Económico": DollarSign,
};

const domainColors: Record<string, string> = {
    "Físico": "#3B82F6",
    "Nutricional": "#10B981",
    "Emocional": "#EC4899",
    "Social": "#8B5CF6",
    "Familiar": "#F59E0B",
    "Económico": "#14B8A6",
};

export default function ResultsPage() {
    const router = useRouter();
    const [scores, setScores] = useState<Record<string, number>>({});
    const [globalScore, setGlobalScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        const shareText = `¡Completé mi diagnóstico de Bienestar 360°!\n\nPuntaje Global: ${globalScore.toFixed(1)}/10\n\n${domains.map(d => `${d}: ${(scores[d] || 0).toFixed(1)}`).join('\n')}\n\n¡Descubre tu bienestar integral!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mi Bienestar 360°',
                    text: shareText,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText);
            alert('¡Resultados copiados al portapapeles!');
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem("ebi_answers");
        if (!saved) {
            router.push("/diagnostico");
            return;
        }

        const answers = JSON.parse(saved);
        const domainScores: Record<string, { total: number; max: number }> = {};

        domains.forEach((d) => {
            domainScores[d] = { total: 0, max: 0 };
        });

        questions.forEach((q) => {
            const answerValue = answers[q.id] || 0;
            if (answerValue > 0) {
                const score = calculateScore({ questionId: q.id, value: answerValue }, q);
                const maxScore = calculateScore({ questionId: q.id, value: 5 }, q);

                if (domainScores[q.domain]) {
                    domainScores[q.domain].total += score;
                    domainScores[q.domain].max += maxScore;
                }
            }
        });

        const finalScores: Record<string, number> = {};
        let totalGlobal = 0;
        let countGlobal = 0;

        Object.keys(domainScores).forEach((d) => {
            const { total, max } = domainScores[d];
            const normalized = max > 0 ? (total / max) * 10 : 0;
            finalScores[d] = Math.round(normalized * 10) / 10;
            totalGlobal += normalized;
            countGlobal++;
        });

        setScores(finalScores);
        setGlobalScore(
            countGlobal > 0 ? Math.round((totalGlobal / countGlobal) * 10) / 10 : 0
        );
        setLoading(false);
    }, [router]);

    const handleReset = () => {
        localStorage.removeItem("ebi_answers");
        router.push("/diagnostico");
    };

    if (loading) return (
        <div className="flex min-h-screen flex-col bg-gradient-mockup px-6 py-8 pb-24">
            <div className="mb-8 animate-pulse">
                <div className="h-8 w-48 bg-white/20 rounded-lg mb-2"></div>
                <div className="h-4 w-32 bg-white/10 rounded"></div>
            </div>

            {/* Skeleton for circular progress */}
            <div className="mb-8 flex flex-col items-center rounded-3xl bg-white/10 p-8 animate-pulse">
                <div className="h-48 w-48 rounded-full bg-white/20 mb-4"></div>
                <div className="h-6 w-24 bg-white/20 rounded"></div>
            </div>

            {/* Skeleton for domain icons */}
            <div className="mb-8 flex justify-around rounded-2xl bg-white/10 p-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-white/20 mb-1"></div>
                        <div className="h-3 w-8 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Skeleton for domain breakdown */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-2xl bg-white/10 p-4 animate-pulse">
                        <div className="h-5 w-32 bg-white/20 rounded mb-2"></div>
                        <div className="h-2 w-full bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const pieData = [
        { name: "Score", value: globalScore },
        { name: "Remaining", value: 10 - globalScore },
    ];

    return (
        <div className="min-h-screen bg-gradient-mockup px-6 py-8 pb-24">
            <div id="results-container" className="animate-fadeIn">
                <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
                    Índice General de Bienestar
                </h1>
                <p className="mb-8 text-white/90 drop-shadow">
                    Tu resultado completo
                </p>

                {/* Circular Progress */}
                <div className="mb-8 flex flex-col items-center rounded-3xl bg-white/15 p-8 shadow-glass backdrop-blur-md border border-white/20 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                    <div className="relative h-48 w-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="rgba(255,255,255,0.2)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white drop-shadow-lg">{globalScore}</span>
                            <span className="text-sm text-white/80">/10</span>
                        </div>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white drop-shadow">
                        {globalScore >= 8
                            ? "Óptimo"
                            : globalScore >= 5
                                ? "Aceptable"
                                : "Crítico"}
                    </p>
                </div>

                {/* Domain Icons Row */}
                <div className="mb-8 flex justify-around rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                    {domains.map((d) => {
                        const Icon = domainIcons[d];
                        const score = scores[d] || 0;
                        return (
                            <div key={d} className="flex flex-col items-center">
                                <div
                                    className="mb-1 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                                    style={{ backgroundColor: domainColors[d] }}
                                >
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white drop-shadow">{score.toFixed(1)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Domain Breakdown */}
                <div className="space-y-3 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                    <h3 className="mb-4 text-lg font-semibold text-white drop-shadow">
                        Desglose por Dominio
                    </h3>
                    {domains.map((d) => {
                        const score = scores[d] || 0;
                        const recommendation = getRecommendations(d, score);
                        return (
                            <div
                                key={d}
                                className="rounded-2xl bg-white/15 p-4 shadow-glass backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 hover:scale-[1.01]"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold text-white drop-shadow">{d}</h3>
                                    <span
                                        className={cn(
                                            "rounded-full px-3 py-1 text-xs font-bold shadow",
                                            score >= 8
                                                ? "bg-green-500 text-white"
                                                : score >= 5
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-red-500 text-white"
                                        )}
                                    >
                                        {score.toFixed(1)}/10
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full transition-all shadow"
                                        style={{
                                            width: `${(score / 10) * 100}%`,
                                            backgroundColor: domainColors[d]
                                        }}
                                    />
                                </div>

                                {/* Recommendations */}
                                {recommendation && (
                                    <div className="mt-3 rounded-xl bg-white/5 p-3 border border-white/10">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                                            <p className="text-xs font-bold text-white">{recommendation.title}</p>
                                        </div>
                                        <ul className="space-y-1">
                                            {recommendation.suggestions.slice(0, 2).map((suggestion, idx) => (
                                                <li key={idx} className="text-xs text-white/80 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <ExportButton globalScore={globalScore} scores={scores} />
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center space-x-2 rounded-2xl bg-white/15 px-6 py-4 font-semibold text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/25 hover:scale-[1.02] active:scale-[0.99]"
                    >
                        <Share2 className="h-5 w-5" />
                        <span>Compartir</span>
                    </button>
                </div>
            </div>

            <button
                onClick={handleReset}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-white/15 p-4 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 border border-white/20 drop-shadow"
            >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reiniciar Diagnóstico
            </button>
        </div>
    );
}
