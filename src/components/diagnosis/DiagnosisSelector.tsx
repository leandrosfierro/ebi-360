'use client';

import {
    ClipboardCheck,
    ArrowRight,
    Globe,
    Home,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurveyOption {
    id: string;
    name: string;
    description: string;
    survey_type: 'base' | 'regulatory' | 'custom';
    country_code?: string;
}

interface DiagnosisSelectorProps {
    surveys: SurveyOption[];
    onSelect: (survey: SurveyOption) => void;
    loading?: boolean;
    companyBranding?: {
        name: string;
        logo_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
    } | null;
}

export function DiagnosisSelector({ surveys, onSelect, loading, companyBranding }: DiagnosisSelectorProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-muted-foreground">Buscando diagnósticos disponibles...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-xl mx-auto px-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
                <div
                    className="w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden group bg-white border border-white/20"
                    style={{
                        backgroundColor: companyBranding?.primary_color ? `${companyBranding.primary_color}10` : undefined,
                        boxShadow: companyBranding?.primary_color ? `0 20px 40px -12px ${companyBranding.primary_color}30` : undefined
                    }}
                >
                    {companyBranding?.logo_url ? (
                        <img
                            src={companyBranding.logo_url}
                            alt={companyBranding.name}
                            className="w-16 h-16 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <ClipboardCheck
                            className="w-12 h-12 text-primary group-hover:rotate-12 transition-transform"
                            style={{ color: companyBranding?.primary_color || undefined }}
                        />
                    )}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight italic uppercase">
                    ¿Qué quieres medir hoy?
                </h1>
                <p className="text-gray-500 text-lg font-medium">
                    {companyBranding?.name ? `${companyBranding.name} te invita a seleccionar un diagnóstico.` : "Selecciona el diagnóstico que deseas completar."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {surveys.map((survey) => (
                    <button
                        key={survey.id}
                        onClick={() => onSelect(survey)}
                        className="group relative flex items-center gap-5 p-6 bg-white border-2 border-transparent rounded-[32px] text-left transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 overflow-hidden"
                        style={{ borderImage: companyBranding?.primary_color ? `linear-gradient(to right, ${companyBranding.primary_color}, ${companyBranding.secondary_color}) 1` : undefined }}
                    >
                        {/* Background Decoration */}
                        <div
                            className={cn("absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700")}
                            style={{ backgroundColor: companyBranding?.primary_color || (survey.survey_type === 'base' ? '#8b5cf6' : '#3b82f6') }}
                        />

                        {/* Icon */}
                        <div
                            className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner")}
                            style={{
                                backgroundColor: companyBranding?.primary_color ? `${companyBranding.primary_color}10` : (survey.survey_type === 'base' ? '#f3e8ff' : '#dbeafe'),
                                color: companyBranding?.primary_color || (survey.survey_type === 'base' ? '#7e22ce' : '#2563eb')
                            }}
                        >
                            {survey.survey_type === 'base' ? <Home className="w-7 h-7" /> :
                                survey.survey_type === 'regulatory' ? <ShieldCheck className="w-7 h-7" /> :
                                    <ClipboardCheck className="w-7 h-7" />}
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">
                                    {survey.name}
                                </h3>
                                {survey.country_code && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                                        <Globe className="w-3 h-3" />
                                        {survey.country_code}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-tight font-bold uppercase tracking-widest line-clamp-2">
                                {survey.description}
                            </p>
                        </div>

                        {/* Arrow */}
                        <div
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-white transition-all duration-300"
                            style={{
                                backgroundColor: undefined, // Let group-hover handle it or define it
                            }}
                            data-hover-bg={companyBranding?.primary_color}
                        >
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="pt-8 text-center">
                <p className="text-gray-400 text-sm font-medium">
                    Tus respuestas son 100% anónimas y seguras.
                </p>
            </div>
        </div>
    );
}
