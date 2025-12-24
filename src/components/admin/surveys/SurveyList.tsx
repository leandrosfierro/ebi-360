'use client';

import { useState, useEffect } from 'react';
import { getSurveys, updateSurveyStatus, deleteSurvey } from '@/lib/surveys/actions';
import { SurveyStatus } from '@/lib/surveys/types';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    Clock,
    Archive,
    Trash2,
    Eye,
    Globe,
    FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SurveyList() {
    const [surveys, setSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadSurveys();
    }, []);

    async function loadSurveys() {
        setLoading(true);
        try {
            const data = await getSurveys();
            setSurveys(data);
        } catch (error) {
            console.error('Error loading surveys:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(id: string, newStatus: SurveyStatus) {
        try {
            await updateSurveyStatus(id, newStatus);
            await loadSurveys();
        } catch (error) {
            alert('Error updating status');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar esta encuesta?')) return;
        try {
            await deleteSurvey(id);
            await loadSurveys();
        } catch (error) {
            alert('Error deleting survey');
        }
    }

    const filteredSurveys = filterStatus === 'all'
        ? surveys
        : surveys.filter(s => s.status === filterStatus);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar encuestas..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple-500/50"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activas</option>
                        <option value="draft">Borradores</option>
                        <option value="archived">Archivadas</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Cargando encuestas...</div>
                ) : filteredSurveys.length === 0 ? (
                    <div className="p-12 text-center glass-card border-dashed border-2 border-white/10">
                        <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No se encontraron encuestas</p>
                    </div>
                ) : (
                    filteredSurveys.map((survey) => (
                        <div key={survey.id} className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                                        survey.survey_type === 'base' ? "bg-purple-500/20 text-purple-400" :
                                            survey.survey_type === 'regulatory' ? "bg-blue-500/20 text-blue-400" :
                                                "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {survey.survey_type === 'base' ? '🏠' :
                                            survey.survey_type === 'regulatory' ? '⚖️' : '📋'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-foreground">{survey.name}</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-mono">
                                                {survey.code} v{survey.version}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{survey.description}</p>
                                        <div className="flex flex-wrap gap-3 text-xs">
                                            <span className={cn(
                                                "flex items-center gap-1",
                                                survey.status === 'active' ? "text-emerald-400" :
                                                    survey.status === 'draft' ? "text-amber-400" :
                                                        "text-rose-400"
                                            )}>
                                                {survey.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    survey.status === 'draft' ? <Clock className="w-3 h-3" /> :
                                                        <Archive className="w-3 h-3" />}
                                                {survey.status.toUpperCase()}
                                            </span>
                                            {survey.country_code && (
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <Globe className="w-3 h-3" />
                                                    {survey.country_code}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground">
                                                ID: {survey.id.split('-')[0]}...
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {survey.status === 'draft' && (
                                        <button
                                            onClick={() => handleStatusChange(survey.id, 'active')}
                                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                            title="Publicar"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {survey.status === 'active' && (
                                        <button
                                            onClick={() => handleStatusChange(survey.id, 'archived')}
                                            className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                                            title="Archivar"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(survey.id)}
                                        className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
