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
            className="flex min-h-screen flex-col bg-mesh-gradient text-foreground"
            suppressHydrationWarning
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 pt-12">
                <button
                    onClick={handleBack}
                    className="rounded-full bg-white p-3 text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:scale-110 active:scale-95 border border-gray-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm border border-gray-100">
                        {currentStep + 1}/{totalSteps}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mx-6 mb-8">
                <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full bg-purple-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="flex flex-1 flex-col justify-center px-6 pb-32">
                <div
                    className={cn(
                        "mb-8 rounded-[24px] bg-white p-8 shadow-sm border border-gray-100 transition-all duration-300",
                        slideDirection === "left" && "translate-x-full opacity-0",
                        slideDirection === "right" && "-translate-x-full opacity-0"
                    )}
                >
                    <span className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                        {currentQuestion.domain}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight text-gray-900">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Options */}
                <div className="space-y-3">
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
                                    "group flex w-full items-center justify-between rounded-2xl p-5 font-medium transition-all duration-200 border",
                                    isSelected
                                        ? "bg-purple-50 border-purple-200 text-purple-900 scale-[1.02]"
                                        : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99]"
                                )}
                            >
                                <span className="flex items-center space-x-3">
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{emoji}</span>
                                    <span>{label}</span>
                                </span>
                                {isSelected && (
                                    <Check className="h-5 w-5 text-purple-600" />
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
