'use client';

import { useState } from 'react';
import { ClipboardCheck, Plus, FileSpreadsheet, Download } from 'lucide-react';
import { SurveyList } from '@/components/admin/surveys/SurveyList';
import { SurveyUploader } from '@/components/admin/surveys/SurveyUploader';

export default function SurveysPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-purple-400" />
                        Gestión de Encuestas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Administra las encuestas base, regulatorias y personalizadas de la plataforma.
                    </p>
                </div>

                {!isUploading && (
                    <div className="flex gap-3 w-full md:w-auto">
                        <a
                            href="/docs/plantilla_encuesta.xlsx"
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar Plantilla
                        </a>
                        <button
                            onClick={() => setIsUploading(true)}
                            className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-bold text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Encuesta
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {isUploading ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <SurveyUploader
                        onSuccess={() => {
                            setIsUploading(false);
                            setRefreshKey(prev => prev + 1);
                        }}
                        onCancel={() => setIsUploading(false)}
                    />
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <SurveyList key={refreshKey} />
                </div>
            )}

            {/* Help Card */}
            {!isUploading && (
                <div className="glass-card p-6 border border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">¿Cómo funciona la gestión modular?</h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                Puedes cargar encuestas diseñadas en Excel. El sistema identificará automáticamente los dominios,
                                las preguntas y el algoritmo de cálculo. Una vez cargada, la encuesta queda en estado "Borrador"
                                hasta que decidas publicarla. Las encuestas publicadas pueden ser asignadas a empresas específicas
                                desde el panel de gestión de empresas.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
