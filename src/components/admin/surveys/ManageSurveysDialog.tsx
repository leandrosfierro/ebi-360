'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import {
    ClipboardCheck,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    Globe,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assignSurveyToCompany, removeSurveyFromCompany } from '@/lib/surveys/actions';

interface ManageSurveysDialogProps {
    companyId: string;
    companyName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageSurveysDialog({ companyId, companyName, open, onOpenChange }: ManageSurveysDialogProps) {
    const [assignedSurveys, setAssignedSurveys] = useState<any[]>([]);
    const [availableSurveys, setAvailableSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    async function loadData() {
        setLoading(true);
        try {
            // 1. Get current assignments
            const { data: assignments, error: assignedError } = await supabase
                .from('company_surveys')
                .select('*, survey:surveys(*)')
                .eq('company_id', companyId);

            if (assignedError) throw assignedError;
            setAssignedSurveys(assignments || []);

            // 2. Get available active surveys not already assigned
            const assignedIds = (assignments || []).map((a: any) => a.survey_id);
            const { data: surveys, error: surveysError } = await supabase
                .from('surveys')
                .select('*')
                .eq('status', 'active');

            if (surveysError) throw surveysError;

            // Filter out already assigned ones
            setAvailableSurveys(surveys.filter(s => !assignedIds.includes(s.id)));
        } catch (error) {
            console.error('Error loading survey data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAssign(surveyId: string) {
        setAssigning(true);
        try {
            const result = await assignSurveyToCompany(companyId, surveyId);
            if (result?.error) {
                alert(`[v2] Error al asignar: ${result.error}`);
            } else {
                await loadData();
            }
        } catch (error: any) {
            console.error('Error assigning survey:', error);
            alert(`[v2] Error de conexión: ${error.message || 'Error desconocido'}`);
        } finally {
            setAssigning(false);
        }
    }

    async function handleRemove(assignmentId: string) {
        if (!confirm('¿Seguro que deseas desvincular esta encuesta de la empresa?')) return;

        setAssigning(true);
        try {
            const result = await removeSurveyFromCompany(assignmentId);
            if (result?.error) {
                alert(`[v2] Error al desvincular: ${result.error}`);
            } else {
                await loadData();
            }
        } catch (error: any) {
            console.error('Error removing assignment:', error);
            alert(`[v2] Error de conexión: ${error.message || 'Error desconocido'}`);
        } finally {
            setAssigning(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl glass-panel p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-600/10 p-6 border-b border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <ClipboardCheck className="w-6 h-6 text-purple-400" />
                            Gestionar Encuestas
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Asigna evaluaciones y normativas a <span className="text-foreground font-bold">{companyName}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                    {/* Assigned Surveys */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Encuestas Asignadas</h3>
                        {loading ? (
                            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
                        ) : assignedSurveys.length === 0 ? (
                            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-muted-foreground italic text-sm">No hay encuestas asignadas actualmente.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {assignedSurveys.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{assignment.survey.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {assignment.survey.survey_type} • v{assignment.survey.version}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemove(assignment.id)}
                                            disabled={assigning}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Available Surveys */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Disponibles para Asignar</h3>
                        {loading ? (
                            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
                        ) : availableSurveys.length === 0 ? (
                            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-muted-foreground italic text-sm">No hay más encuestas activas disponibles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {availableSurveys.map((survey) => (
                                    <div key={survey.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                survey.survey_type === 'base' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                            )}>
                                                {survey.survey_type === 'base' ? <ClipboardCheck className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{survey.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {survey.country_code ? `🌎 ${survey.country_code}` : '🌐 GLOBAL'} • {survey.survey_type}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-bold transition-all px-4"
                                            onClick={() => handleAssign(survey.id)}
                                            disabled={assigning}
                                        >
                                            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                                            Asignar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl px-8"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
