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
            }, 250);
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
            }, 250);
        } else {
            router.push("/");
        }
    };

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
                    }, 250);
                }
            } else if (swipeDistance < 0 && currentStep > 0) {
                // Swipe right - previous question
                handleBack();
            }
        }
    };

    return (
        <div
            className="flex min-h-screen flex-col bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600"
            suppressHydrationWarning
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6">
                <button
                    onClick={handleBack}
                    className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/30"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <span className="text-sm font-semibold text-white drop-shadow">
                    {currentStep + 1} de {totalSteps}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mx-6 mb-8 h-2 overflow-hidden rounded-full bg-white/20 backdrop-blur-md">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="flex flex-1 flex-col justify-center px-6">
                <div
                    className={cn(
                        "mb-8 rounded-3xl bg-white/15 p-8 shadow-glass backdrop-blur-md border border-white/20 transition-all duration-300",
                        slideDirection === "left" && "translate-x-full opacity-0",
                        slideDirection === "right" && "-translate-x-full opacity-0"
                    )}
                >
                    <span className="mb-4 inline-block rounded-full bg-white/25 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm drop-shadow">
                        {currentQuestion.domain}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Options */}
                <div className="space-y-3 pb-24">
                    {[
                        { value: 1, label: "Muy en desacuerdo", emoji: "😔" },
                        { value: 2, label: "En desacuerdo", emoji: "😕" },
                        { value: 3, label: "Neutral", emoji: "😐" },
                        { value: 4, label: "De acuerdo", emoji: "🙂" },
                        { value: 5, label: "Muy de acuerdo", emoji: "😊" },
                    ].map(({ value, label, emoji }) => {
                        const isSelected = answers[currentQuestion.id] === value;
                        return (
                            <button
                                key={value}
                                onClick={() => handleAnswer(value)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-2xl p-4 font-semibold transition-all active:scale-98",
                                    isSelected
                                        ? "bg-white text-purple-700 shadow-glass-lg"
                                        : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25 border border-white/20"
                                )}
                            >
                                <span className="flex items-center space-x-3">
                                    <span className="text-2xl">{emoji}</span>
                                    <span className={isSelected ? "" : "drop-shadow"}>{label}</span>
                                </span>
                                {isSelected && (
                                    <Check className="h-5 w-5 text-purple-700" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Swipe Hint */}
                {currentStep === 0 && !answers[currentQuestion.id] && (
                    <div className="fixed bottom-32 left-0 right-0 flex justify-center">
                        <div className="rounded-full bg-white/20 px-4 py-2 text-xs text-white backdrop-blur-md">
                            💡 Desliza para navegar entre preguntas
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
