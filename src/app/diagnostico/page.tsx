'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { DiagnosisSelector } from "@/components/diagnosis/DiagnosisSelector";
import { questions as staticQuestions } from "@/lib/logic";

export default function DiagnosticPage() {
    const router = useRouter();
    const supabase = createClient();

    // State for survey selection
    const [assignedSurveys, setAssignedSurveys] = useState<any[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
    const [loadingSurveys, setLoadingSurveys] = useState(true);

    // State for diagnosis
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [mounted, setMounted] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [companyBranding, setCompanyBranding] = useState<any>(null);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // 1. Initial Load: Get User's Company and Assigned Surveys
    useEffect(() => {
        setMounted(true);
        loadSurveys();
    }, []);

    async function loadSurveys() {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                router.push('/login');
                return;
            }

            // Get user's profile to find company_id
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('company_id, full_name')
                .eq('id', user.id)
                .single();

            if (profileError || !profile?.company_id) {
                setLoadingSurveys(false);
                setErrorState({
                    title: "Sin Empresa Asignada",
                    message: `Hola ${profile?.full_name || 'colaborador'}, aún no tienes una empresa vinculada a tu perfil. Por favor, solicita a tu administrador que te asigne a una organización.`
                });
                return;
            }

            // Get company branding
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .select('name, logo_url, primary_color, secondary_color, font')
                .eq('id', profile.company_id)
                .single();

            if (!companyError && company) {
                setCompanyBranding(company);
            }

            // Get assigned surveys
            const { data: assignments, error: assignError } = await supabase
                .from('company_surveys')
                .select('*, survey:surveys(*)')
                .eq('company_id', profile.company_id)
                .eq('is_active', true);

            if (assignError) throw assignError;

            const surveys = (assignments || [])
                .filter((a: any) => a.survey) // Ensure survey data exists
                .map((a: any) => a.survey);

            setAssignedSurveys(surveys);

            if (surveys.length === 0) {
                setErrorState({
                    title: "No hay diagnósticos",
                    message: "Tu empresa aún no tiene diagnósticos activos asignados. Vuelve a consultar más tarde."
                });
            } else if (surveys.length === 1) {
                // If only one survey, select it automatically
                handleSelectSurvey(surveys[0]);
            }
        } catch (error: any) {
            console.error('Error loading surveys:', error);
            setErrorState({
                title: "Error de Carga",
                message: "Hubo un problema al cargar tus diagnósticos. Por favor intenta de nuevo."
            });
        } finally {
            setLoadingSurveys(false);
        }
    }

    const [errorState, setErrorState] = useState<{ title: string, message: string } | null>(null);

    async function handleSelectSurvey(survey: any) {
        setSelectedSurvey(survey);
        setLoadingQuestions(true);

        try {
            // Load questions for this survey
            const { data: dbQuestions, error } = await supabase
                .from('survey_questions')
                .select('*')
                .eq('survey_id', survey.id)
                .order('question_number', { ascending: true });

            if (error) throw error;

            // Map DB fields to component needs if necessary
            // For now, our component uses .domain and .text which are in DB
            setQuestions(dbQuestions || []);

            // Check if there are saved answers for this specific survey
            const saved = localStorage.getItem(`ebi_answers_${survey.id}`);
            if (saved) {
                setAnswers(JSON.parse(saved));
            } else {
                setAnswers({});
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    }

    // 2. Logic for Diagnosis (after survey selection)
    const currentQuestion = questions[currentStep];
    const totalSteps = questions.length;
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

    const handleAnswer = (value: number) => {
        const questionId = currentQuestion.id;
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        if (mounted && selectedSurvey) {
            localStorage.setItem(`ebi_answers_${selectedSurvey.id}`, JSON.stringify(newAnswers));
        }

        if (currentStep < totalSteps - 1) {
            setSlideDirection("left");
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setSlideDirection(null);
            }, 400);
        } else {
            // Store selected survey ID for results page
            if (selectedSurvey) {
                localStorage.setItem('last_survey_id', selectedSurvey.id);
            }
            router.push("/resultados");
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setSlideDirection("right");
            setTimeout(() => {
                setCurrentStep(currentStep - 1);
                setSlideDirection(null);
            }, 400);
        } else {
            setSelectedSurvey(null);
            setQuestions([]);
            setCurrentStep(0);
        }
    };

    const getDomainStyles = (domain: string) => {
        const lower = (domain || "").toLowerCase();

        // Físico / Ambiente / Nutricional (Teal/Green)
        if (lower.includes("físico") || lower.includes("física") || lower.includes("ambiente") || lower.includes("nutricional")) return {
            badge: "bg-teal-100 text-teal-800",
            bar: "bg-teal-500",
            optionSelected: "bg-teal-50 border-teal-200 ring-teal-100 text-teal-900",
            checkBg: "bg-teal-100",
            checkIcon: "text-teal-600"
        };

        // Emocional / Cultura / Mental (Pink/Rose)
        if (lower.includes("emocional") || lower.includes("mental") || lower.includes("cultura")) return {
            badge: "bg-pink-100 text-pink-800",
            bar: "bg-pink-500",
            optionSelected: "bg-pink-50 border-pink-200 ring-pink-100 text-pink-900",
            checkBg: "bg-pink-100",
            checkIcon: "text-pink-600"
        };

        // Social / Liderazgo / Prevención (Indigo/Blue)
        if (lower.includes("social") || lower.includes("liderazgo") || lower.includes("prevención")) return {
            badge: "bg-indigo-100 text-indigo-800",
            bar: "bg-indigo-500",
            optionSelected: "bg-indigo-50 border-indigo-200 ring-indigo-100 text-indigo-900",
            checkBg: "bg-indigo-100",
            checkIcon: "text-indigo-600"
        };

        // Valores / Espiritual / Tarea (Amber/Orange)
        if (lower.includes("valores") || lower.includes("espiritual") || lower.includes("tarea")) return {
            badge: "bg-amber-100 text-amber-800",
            bar: "bg-amber-500",
            optionSelected: "bg-amber-50 border-amber-200 ring-amber-100 text-amber-900",
            checkBg: "bg-amber-100",
            checkIcon: "text-amber-600"
        };

        // Profesional / Trabajo / Económico (Blue/Cyan)
        if (lower.includes("profesional") || lower.includes("trabajo") || lower.includes("económico")) return {
            badge: "bg-blue-100 text-blue-800",
            bar: "bg-blue-500",
            optionSelected: "bg-blue-50 border-blue-200 ring-blue-100 text-blue-900",
            checkBg: "bg-blue-100",
            checkIcon: "text-blue-600"
        };

        return {
            badge: "bg-purple-100 text-purple-800",
            bar: "bg-purple-600",
            optionSelected: "bg-purple-50 border-purple-200 ring-purple-100 text-purple-900",
            checkBg: "bg-purple-100",
            checkIcon: "text-purple-600"
        };
    };

    // If survey list is loading
    if (loadingSurveys) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-mesh-gradient">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            </div>
        );
    }

    // If there's an error state (no company or no surveys)
    if (errorState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-mesh-gradient flex-col p-6 text-center">
                <div className="max-w-md p-8 glass-card rounded-[32px] border border-white/40 shadow-xl animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
                        <ArrowLeft className="w-10 h-10 text-amber-600 cursor-pointer" onClick={() => router.push('/perfil')} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{errorState.title}</h2>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">{errorState.message}</p>
                    <button
                        onClick={() => router.push('/perfil')}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Volver al Perfil
                    </button>
                </div>
            </div>
        );
    }

    // If no survey selected yet, show selector
    if (!selectedSurvey) {
        return (
            <div className="flex min-h-screen flex-col bg-mesh-gradient justify-center py-12">
                <DiagnosisSelector
                    surveys={assignedSurveys}
                    onSelect={handleSelectSurvey}
                    companyBranding={companyBranding}
                />
            </div>
        );
    }

    // If loading questions for selected survey
    if (loadingQuestions || !currentQuestion) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-mesh-gradient flex-col gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                <p className="text-gray-500 font-medium">Cargando preguntas de {selectedSurvey.name}...</p>
            </div>
        );
    }

    const domainStyle = getDomainStyles(currentQuestion.domain);

    return (
        <div
            className="flex min-h-screen flex-col bg-mesh-gradient text-foreground transition-colors duration-500"
            style={companyBranding?.font ? { fontFamily: companyBranding.font } : {}}
            suppressHydrationWarning
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 pt-12 relative z-10">
                <button
                    onClick={handleBack}
                    className="rounded-full bg-white/80 backdrop-blur-sm p-3 text-gray-700 shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-95 border border-gray-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    {companyBranding?.logo_url ? (
                        <img src={companyBranding.logo_url} alt={companyBranding.name} className="h-8 w-auto object-contain drop-shadow-sm" />
                    ) : (
                        <span className="text-xl font-black italic tracking-tighter text-gray-900 border-b-2 border-primary">EBI 360</span>
                    )}
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/50 mb-1" style={{ color: companyBranding?.primary_color ? `${companyBranding.primary_color}80` : undefined }}>
                        {selectedSurvey.name}
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-gray-500">
                            {Math.round(progress)}%
                        </span>
                        <div className="relative h-2 w-20 overflow-hidden rounded-full bg-gray-200/50">
                            <div
                                className={cn("h-full transition-all duration-500 ease-out rounded-full shadow-inner")}
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: companyBranding?.secondary_color || domainStyle.bar.replace('bg-', '')
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="flex flex-1 flex-col justify-center px-6 pb-32 max-w-xl mx-auto w-full">
                <div
                    className={cn(
                        "mb-8 transition-all duration-500 ease-in-out",
                        slideDirection === "left" && "translate-x-full opacity-0 scale-95",
                        slideDirection === "right" && "-translate-x-full opacity-0 scale-95",
                        !slideDirection && "translate-x-0 opacity-100 scale-100"
                    )}
                >
                    <div className="mb-6 flex justify-center">
                        <span className={cn("inline-flex items-center rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-sm transition-colors duration-300", domainStyle.badge)}>
                            {currentQuestion.domain}
                        </span>
                    </div>

                    <h2 className="text-center text-3xl font-black leading-tight text-gray-900 drop-shadow-sm tracking-tight px-4">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                {/* Options */}
                <div className={cn(
                    "grid grid-cols-1 gap-4 transition-all duration-500 delay-75",
                    slideDirection ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
                )}>
                    {[
                        { value: 1, label: "Muy en desacuerdo", emoji: "😔" },
                        { value: 2, label: "En desacuerdo", emoji: "😕" },
                        { value: 3, label: "Neutral", emoji: "😐" },
                        { value: 4, label: "De acuerdo", emoji: "🙂" },
                        { value: 5, label: "Muy de acuerdo", emoji: "🥰" },
                    ].map(({ value, label, emoji }) => {
                        const isSelected = answers[currentQuestion.id] === value;
                        return (
                            <button
                                key={value}
                                onClick={() => handleAnswer(value)}
                                className={cn(
                                    "group relative flex w-full items-center justify-between rounded-[24px] p-5 font-bold transition-all duration-300 border shadow-sm outline-none",
                                    isSelected
                                        ? cn("scale-[1.02] shadow-xl z-10 ring-2", domainStyle.optionSelected)
                                        : "bg-white border-transparent hover:border-gray-100 hover:bg-white/95 hover:shadow-lg hover:-translate-y-1"
                                )}
                            >
                                <span className="flex items-center space-x-4">
                                    <span className="text-4xl transition-transform duration-300 group-hover:scale-125 filter-none drop-shadow-sm">
                                        {emoji}
                                    </span>
                                    <span className={cn(
                                        "text-lg transition-colors tracking-tight",
                                        isSelected ? "text-gray-900" : "text-gray-600"
                                    )}>
                                        {label}
                                    </span>
                                </span>
                                {isSelected && (
                                    <div className={cn("rounded-full p-1.5 animate-in zoom-in spin-in-12 duration-500", domainStyle.checkBg)}>
                                        <Check className={cn("h-5 w-5", domainStyle.checkIcon)} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
