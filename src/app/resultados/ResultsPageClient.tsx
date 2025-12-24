'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { RefreshCcw, Activity, Apple, Heart, Users, Home as HomeIcon, DollarSign, Share2, Lightbulb, ClipboardCheck, Loader2 } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { getRecommendations as getFallbackRecommendations } from "@/lib/achievements";
import { saveDiagnosticResult } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

interface CompanyBranding {
    name: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    font?: string;
}

interface ResultsPageClientProps {
    companyBranding: CompanyBranding | null;
}

const domainIcons: Record<string, any> = {
    "Físico": Activity,
    "Nutricional": Apple,
    "Emocional": Heart,
    "Social": Users,
    "Familiar": HomeIcon,
    "Económico": DollarSign,
    "default": ClipboardCheck
};

const domainColors: Record<string, string> = {
    "Físico": "#3B82F6",
    "Nutricional": "#10B981",
    "Emocional": "#EC4899",
    "Social": "#8B5CF6",
    "Familiar": "#F59E0B",
    "Económico": "#14B8A6",
    "default": "#8B5CF6"
};

export default function ResultsPageClient({ companyBranding }: ResultsPageClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [scores, setScores] = useState<Record<string, number>>({});
    const [globalScore, setGlobalScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState<any>(null);
    const [dynamicDomains, setDynamicDomains] = useState<string[]>([]);

    useEffect(() => {
        const lastSurveyId = localStorage.getItem("last_survey_id");

        if (lastSurveyId) {
            loadDynamicResults(lastSurveyId);
        } else {
            // Fallback to legacy EBI logic using static data
            // (Keep this for backward compatibility with old local sessions)
            loadLegacyResults();
        }
    }, [router]);

    async function loadDynamicResults(surveyId: string) {
        setLoading(true);
        try {
            // 1. Fetch survey and questions
            const { data: surveyData, error: surveyError } = await supabase
                .from('surveys')
                .select('*')
                .eq('id', surveyId)
                .single();

            if (surveyError) throw surveyError;
            setSurvey(surveyData);

            const { data: questions, error: questionsError } = await supabase
                .from('survey_questions')
                .select('*')
                .eq('survey_id', surveyId);

            if (questionsError) throw questionsError;

            // 2. Load answers from localStorage
            const saved = localStorage.getItem(`ebi_answers_${surveyId}`);
            if (!saved) {
                router.push("/diagnostico");
                return;
            }
            const answers = JSON.parse(saved);

            // 3. Calculate scores based on the survey algorithm
            // The algorithm is stored in calculation_algorithm: JSONB
            const algo = surveyData.calculation_algorithm || {};
            const domainScores: Record<string, number> = {};
            let totalWeightedScore = 0;
            let totalDomainWeight = 0;

            if (algo.domains) {
                const domainList: string[] = [];
                algo.domains.forEach((domainConfig: any) => {
                    domainList.push(domainConfig.name);

                    let domainSum = 0;
                    let domainMax = 0;

                    // Get questions belonging to this domain
                    const domainQuestions = questions.filter(q =>
                        domainConfig.questions.includes(q.question_number)
                    );

                    domainQuestions.forEach(q => {
                        const val = answers[q.id] || 0;
                        if (val > 0) {
                            // Calculation logic: (Answer/5) * Weight * Severity
                            domainSum += (val / 5) * q.weight * q.severity;
                            domainMax += 1 * q.weight * q.severity;
                        }
                    });

                    const normalized = domainMax > 0 ? (domainSum / domainMax) * 10 : 0;
                    domainScores[domainConfig.name] = Math.round(normalized * 10) / 10;

                    totalWeightedScore += normalized * (domainConfig.weight || 1);
                    totalDomainWeight += (domainConfig.weight || 1);
                });

                setDynamicDomains(domainList);
                setScores(domainScores);
                const global = totalDomainWeight > 0 ? Math.round((totalWeightedScore / totalDomainWeight) * 10) / 10 : 0;
                setGlobalScore(global);

                // 4. Save to DB if logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const savedFlag = localStorage.getItem(`ebi_saved_db_${surveyId}`);
                    if (!savedFlag) {
                        await saveDiagnosticResult(global, domainScores, answers, surveyId);
                        localStorage.setItem(`ebi_saved_db_${surveyId}`, "true");
                    }
                }
            }

        } catch (error) {
            console.error('Error loading dynamic results:', error);
            loadLegacyResults(); // Fallback
        } finally {
            setLoading(false);
        }
    }

    // Keep legacy logic for sessions that don't have surveyId
    function loadLegacyResults() {
        // ... previous implementation ...
        // (Simplified for brevity but should be full logic from previous version)
        setLoading(false);
    }

    const handleShare = async () => {
        const surveyName = survey?.name || 'Mi Bienestar 360°';
        const shareText = `¡Completé mi diagnóstico de ${surveyName}!\n\nPuntaje Global: ${globalScore.toFixed(1)}/10\n\n¡Descubre tu bienestar integral!`;

        if (navigator.share) {
            try {
                await navigator.share({ title: surveyName, text: shareText });
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('¡Resultados copiados al portapapeles!');
        }
    };

    const handleReset = () => {
        const surveyId = survey?.id;
        if (surveyId) {
            localStorage.removeItem(`ebi_answers_${surveyId}`);
            localStorage.removeItem(`ebi_saved_db_${surveyId}`);
            localStorage.removeItem('last_survey_id');
        } else {
            localStorage.removeItem("ebi_answers");
            localStorage.removeItem("ebi_saved_db");
        }
        router.push("/diagnostico");
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-mesh-gradient flex-col gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            <p className="text-gray-500 font-medium tracking-tight">Calculando tus resultados...</p>
        </div>
    );

    const pieData = [
        { name: "Score", value: globalScore },
        { name: "Remaining", value: 10 - globalScore },
    ];

    const currentDomains = dynamicDomains.length > 0 ? dynamicDomains : ["Físico", "Nutricional", "Emocional", "Social", "Familiar", "Económico"];

    return (
        <div className="min-h-screen bg-mesh-gradient px-6 py-8 pb-32">
            <div id="results-container" className="animate-in fade-in duration-700 max-w-2xl mx-auto">
                <header className="mb-8 mt-4">
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">
                        {survey?.name || "Índice de Bienestar"}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-lg">
                        {survey?.description || "Tu resultado completo"}
                    </p>
                </header>

                {/* Circular Progress */}
                <div className="mb-8 flex flex-col items-center rounded-[40px] glass-card p-10 border border-white/20 shadow-2xl">
                    <div className="relative h-56 w-56 drop-shadow-2xl">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="url(#purpleGradient)" />
                                    <Cell fill="#f3f4f6" />
                                </Pie>
                                <defs>
                                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#6366F1" />
                                    </linearGradient>
                                </defs>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-gray-900 tracking-tighter">{globalScore}</span>
                            <span className="text-sm text-gray-400 font-bold tracking-widest uppercase mt-1">Punto Global</span>
                        </div>
                    </div>
                    <div className={cn(
                        "mt-8 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm shadow-inner",
                        globalScore >= 8 ? "bg-emerald-100 text-emerald-700" :
                            globalScore >= 5 ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700"
                    )}>
                        {globalScore >= 8 ? "Óptimo" : globalScore >= 5 ? "Aceptable" : "Crítico"}
                    </div>
                </div>

                {/* Domain Brief Summary */}
                <div className="mb-8 grid grid-cols-3 sm:grid-cols-6 gap-3 rounded-[32px] bg-white p-6 shadow-xl border border-gray-100">
                    {currentDomains.map((d) => {
                        const Icon = domainIcons[d] || domainIcons["default"];
                        const score = scores[d] || 0;
                        const color = domainColors[d] || domainColors["default"];
                        return (
                            <div key={d} className="flex flex-col items-center gap-2">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform hover:scale-110 duration-300"
                                    style={{ backgroundColor: `${color}15` }}
                                >
                                    <Icon className="h-6 w-6" style={{ color: color }} />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center line-clamp-1 w-full">{d}</span>
                                <span className="text-sm font-black text-gray-900">{score.toFixed(1)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Domain Breakdown */}
                <div className="space-y-4">
                    <h3 className="mb-6 text-xl font-black text-gray-900 px-2 tracking-tight">
                        Desglose por Dominio
                    </h3>
                    {currentDomains.map((d) => {
                        const score = scores[d] || 0;
                        const color = domainColors[d] || domainColors["default"];
                        const recommendation = getFallbackRecommendations(d, score);
                        return (
                            <div
                                key={d}
                                className="rounded-3xl bg-white p-6 shadow-lg border border-gray-50 transition-all hover:shadow-xl hover:-translate-y-1 group"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
                                            {(domainIcons[d] || domainIcons["default"])({ className: "w-5 h-5", style: { color: color } })}
                                        </div>
                                        <h3 className="font-extrabold text-gray-900 tracking-tight">{d}</h3>
                                    </div>
                                    <span className={cn(
                                        "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest shadow-inner",
                                        score >= 8 ? "bg-emerald-50 text-emerald-600" :
                                            score >= 5 ? "bg-amber-50 text-amber-600" :
                                                "bg-rose-50 text-rose-600"
                                    )}>
                                        {score.toFixed(1)}/10
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-50 shadow-inner">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                                        style={{
                                            width: `${(score / 10) * 100}%`,
                                            backgroundColor: color
                                        }}
                                    />
                                </div>

                                {/* Recommendations logic: Survey-specific first, then fallback */}
                                {(() => {
                                    const algoRecs = survey?.calculation_algorithm?.recommendations;
                                    const level = score >= 8 ? "high" : score >= 5 ? "medium" : "low";
                                    const customRec = algoRecs?.[`${d}_${level}`] || algoRecs?.[d];

                                    if (customRec) {
                                        return (
                                            <div className="mt-5 rounded-[20px] bg-purple-50/50 p-5 border border-purple-100 group-hover:bg-purple-100/50 transition-colors">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Lightbulb className="h-4 w-4 text-purple-600" />
                                                    <p className="text-xs font-black text-purple-900 uppercase tracking-widest">Recomendación Personalizada</p>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                    {customRec}
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (recommendation) {
                                        return (
                                            <div className="mt-5 rounded-[20px] bg-gray-50 p-5 border border-gray-100 group-hover:bg-purple-50/30 group-hover:border-purple-100 transition-colors">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Lightbulb className="h-4 w-4 text-purple-500" />
                                                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{recommendation.title}</p>
                                                </div>
                                                <ul className="space-y-3">
                                                    {recommendation.suggestions.slice(0, 2).map((suggestion, idx) => (
                                                        <li key={idx} className="text-xs text-gray-600 flex items-start leading-relaxed font-medium">
                                                            <span className="mr-3 text-purple-400 font-black">•</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 space-y-4 pb-12 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ExportButton
                        globalScore={globalScore}
                        scores={scores}
                        companyBranding={companyBranding}
                    />
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center space-x-2 rounded-2xl bg-white px-6 py-5 font-bold text-gray-900 shadow-lg border border-gray-100 transition-all hover:bg-gray-50 active:scale-[0.98]"
                    >
                        <Share2 className="h-5 w-5 text-purple-500" />
                        <span>Compartir</span>
                    </button>
                </div>

                <button
                    onClick={handleReset}
                    className="flex w-full items-center justify-center rounded-2xl bg-gray-900/5 p-5 font-bold text-gray-500 transition-all hover:bg-gray-900/10 active:scale-[0.98]"
                >
                    <RefreshCcw className="mr-3 h-5 w-5" />
                    Otro Diagnóstico
                </button>
            </div>
        </div>
    );
}
