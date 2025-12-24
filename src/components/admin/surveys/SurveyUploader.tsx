'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseSurveyExcel, validateSurveyData } from '@/lib/surveys/parser';
import { saveSurvey } from '@/lib/surveys/actions';
import { SurveyImportData } from '@/lib/surveys/types';
import { cn } from '@/lib/utils';

interface SurveyUploaderProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function SurveyUploader({ onSuccess, onCancel }: SurveyUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [preview, setPreview] = useState<SurveyImportData | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setParsing(true);
        setErrors([]);
        setPreview(null);

        try {
            const data = await parseSurveyExcel(selectedFile);
            const validationErrors = validateSurveyData(data);

            if (validationErrors.length > 0) {
                setErrors(validationErrors);
            } else {
                setPreview(data);
            }
        } catch (error: any) {
            setErrors([error.message || 'Error al procesar el archivo Excel']);
        } finally {
            setParsing(false);
        }
    }

    async function handleSave() {
        if (!preview) return;
        setSaving(true);
        try {
            await saveSurvey(preview);
            onSuccess();
        } catch (error: any) {
            setErrors([error.message || 'Error al guardar la encuesta en la base de datos']);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="glass-card p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Subir Nueva Encuesta</h2>
                    <p className="text-muted-foreground text-sm mt-1">Carga un archivo Excel con el formato modular estándar</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            {/* Dropzone */}
            {!file && (
                <div className="relative group">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 group-hover:border-purple-500/50 rounded-2xl p-12 text-center transition-all bg-white/5 group-hover:bg-purple-500/5">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4 mx-auto group-hover:scale-110 group-hover:text-purple-400 transition-all" />
                        <p className="font-semibold text-foreground">Seleccionar archivo Excel</p>
                        <p className="text-xs text-muted-foreground mt-2">Formatos aceptados: .xlsx, .xls (Máx 5MB)</p>
                    </div>
                </div>
            )}

            {/* Parsing State */}
            {parsing && (
                <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Validando estructura del archivo...</p>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Se encontraron errores:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-rose-400/80 space-y-1">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                    <button
                        onClick={() => { setFile(null); setErrors([]); }}
                        className="mt-4 text-xs font-semibold underline text-rose-400 hover:text-rose-300"
                    >
                        Intentar con otro archivo
                    </button>
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="mt-4 space-y-6">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-400">Archivo validado correctamente</p>
                            <p className="text-xs text-emerald-400/70">Listo para importar a la plataforma</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                            <p className="text-sm font-semibold text-foreground">{preview.metadata.name}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Código</p>
                            <p className="text-sm font-semibold text-foreground">{preview.metadata.code} v{preview.metadata.version}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                            <p className="text-sm font-semibold text-foreground capitalize">{preview.metadata.survey_type}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Preguntas</p>
                            <p className="text-sm font-semibold text-foreground">{preview.questions.length}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            disabled={saving}
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="flex-1 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold disabled:opacity-50"
                        >
                            Cambiar archivo
                        </button>
                        <button
                            disabled={saving}
                            onClick={handleSave}
                            className="flex-[2] px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-bold text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                            ) : (
                                'Guardar Encuesta'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
