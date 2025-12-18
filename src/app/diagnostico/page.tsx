"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { questions } from "@/lib/logic";
import { cn } from "@/lib/utils";

export default function DiagnosticPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [mounted, setMounted] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("ebi_answers");
        if (saved) {
            setAnswers(JSON.parse(saved));
        }
    }, []);

    const currentQuestion = questions[currentStep];
    const totalSteps = questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleAnswer = (value: number) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        if (mounted) {
            localStorage.setItem("ebi_answers", JSON.stringify(newAnswers));
        }

        if (currentStep < totalSteps - 1) {
            setSlideDirection("left");
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setSlideDirection(null);
            }, 400);
        } else {
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
            router.push("/");
        }
    };

    // ... touch handlers remain same ...
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0 && currentStep < totalSteps - 1) {
                // Swipe left - next question (only if answered)
                if (answers[currentQuestion.id]) {
                    setSlideDirection("left");
                    setTimeout(() => {
                        setCurrentStep(currentStep + 1);
                        setSlideDirection(null);
                    }, 400);
                }
            } else if (swipeDistance < 0 && currentStep > 0) {
                // Swipe right - previous question
                handleBack();
            }
        }
    };

    const getDomainStyles = (domain: string) => {
        const lower = domain.toLowerCase();
        if (lower.includes("físico") || lower.includes("física")) return {
            badge: "bg-teal-100 text-teal-800",
            bar: "bg-teal-500",
            optionSelected: "bg-teal-50 border-teal-200 ring-teal-100 text-teal-900",
            checkBg: "bg-teal-100",
            checkIcon: "text-teal-600"
        };
        if (lower.includes("emocional") || lower.includes("mental")) return {
            badge: "bg-pink-100 text-pink-800",
            bar: "bg-pink-500",
            optionSelected: "bg-pink-50 border-pink-200 ring-pink-100 text-pink-900",
            checkBg: "bg-pink-100",
            checkIcon: "text-pink-600"
        };
        if (lower.includes("social")) return {
            badge: "bg-indigo-100 text-indigo-800",
            bar: "bg-indigo-500",
            optionSelected: "bg-indigo-50 border-indigo-200 ring-indigo-100 text-indigo-900",
            checkBg: "bg-indigo-100",
            checkIcon: "text-indigo-600"
        };
        if (lower.includes("valores") || lower.includes("espiritual")) return {
            badge: "bg-amber-100 text-amber-800",
            bar: "bg-amber-500",
            optionSelected: "bg-amber-50 border-amber-200 ring-amber-100 text-amber-900",
            checkBg: "bg-amber-100",
            checkIcon: "text-amber-600"
        };
        if (lower.includes("profesional") || lower.includes("trabajo")) return {
            badge: "bg-blue-100 text-blue-800",
            bar: "bg-blue-500",
            optionSelected: "bg-blue-50 border-blue-200 ring-blue-100 text-blue-900",
            checkBg: "bg-blue-100",
            checkIcon: "text-blue-600"
        };

        // Default Purple
        return {
            badge: "bg-purple-100 text-purple-800",
            bar: "bg-purple-600",
            optionSelected: "bg-purple-50 border-purple-200 ring-purple-100 text-purple-900",
            checkBg: "bg-purple-100",
            checkIcon: "text-purple-600"
        };
    };

    const domainStyle = getDomainStyles(currentQuestion.domain);

    return (
        <div
            className="flex min-h-screen flex-col bg-mesh-gradient text-foreground transition-colors duration-500"
            suppressHydrationWarning
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 pt-12">
                <button
                    onClick={handleBack}
                    className="rounded-full bg-white/80 backdrop-blur-sm p-3 text-gray-700 shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-95 border border-gray-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Tu Progreso
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">
                            {Math.round(progress)}%
                        </span>
                        <div className="relative h-2 w-24 overflow-hidden rounded-full bg-gray-200/50">
                            <div
                                className={cn("h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", domainStyle.bar)}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="flex flex-1 flex-col justify-center px-6 pb-32 max-w-lg mx-auto w-full">
                <div
                    className={cn(
                        "mb-6 transition-all duration-500 ease-in-out",
                        slideDirection === "left" && "translate-x-full opacity-0 scale-95",
                        slideDirection === "right" && "-translate-x-full opacity-0 scale-95",
                        !slideDirection && "translate-x-0 opacity-100 scale-100"
                    )}
                >
                    <div className="mb-6 flex justify-center">
                        <span className={cn("inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-300", domainStyle.badge)}>
                            {currentQuestion.domain}
                        </span>
                    </div>

                    <h2 className="text-center text-3xl font-bold leading-tight text-gray-900 drop-shadow-sm">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Options */}
                <div className={cn(
                    "space-y-3 transition-all duration-500 delay-75",
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
                                    "group relative flex w-full items-center justify-between rounded-2xl p-5 font-medium transition-all duration-200 border shadow-sm outline-none",
                                    isSelected
                                        ? cn("scale-[1.02] shadow-md z-10 ring-2", domainStyle.optionSelected)
                                        : "bg-white border-transparent hover:border-gray-100 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5"
                                )}
                            >
                                <span className="flex items-center space-x-4">
                                    <span className="text-3xl transition-transform duration-300 group-hover:scale-125 filter-none">
                                        {emoji}
                                    </span>
                                    <span className={cn(
                                        "text-lg transition-colors",
                                        isSelected ? "text-gray-900 font-bold" : "text-gray-600"
                                    )}>
                                        {label}
                                    </span>
                                </span>
                                {isSelected && (
                                    <div className={cn("rounded-full p-1 animate-in zoom-in spin-in-12 duration-300", domainStyle.checkBg)}>
                                        <Check className={cn("h-5 w-5", domainStyle.checkIcon)} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Swipe Hint */}
                {currentStep === 0 && !answers[currentQuestion.id] && (
                    <div className="fixed bottom-32 left-0 right-0 flex justify-center pointer-events-none">
                        <div className="rounded-full bg-gray-900/10 px-4 py-2 text-xs text-gray-600 backdrop-blur-sm">
                            💡 Desliza para navegar entre preguntas
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
