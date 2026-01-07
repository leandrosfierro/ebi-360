"use client";

import { useState, useEffect } from "react";
import { Mail, Save, Loader2, ArrowLeft, Eye, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getCompanyInvitationTemplate, updateCompanyInvitationTemplate } from "@/lib/invitation-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CompanyEmailModule() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [subject, setSubject] = useState("");
    const [bodyHtml, setBodyHtml] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        try {
            setIsLoading(true);
            const result = await getCompanyInvitationTemplate();
            if (result && 'data' in result && result.data) {
                setSubject(result.data.subject);
                setBodyHtml(result.data.body_html);
            } else if (result && 'error' in result) {
                setMessage({ type: 'error', text: result.error as string });
            }
        } catch (error) {
            console.error("Error loading template:", error);
            setMessage({ type: 'error', text: "Error al conectar con el servidor" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        const result = await updateCompanyInvitationTemplate(subject, bodyHtml);
        if ('success' in result && result.success) {
            setMessage({ type: 'success', text: "Plantilla actualizada correctamente" });
        } else {
            const errorText = (result as { error?: string }).error || "Error al guardar";
            setMessage({ type: 'error', text: errorText });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Cargando módulo de emails...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/company"
                        className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Configuración de Emails</h2>
                        <p className="text-muted-foreground italic flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Personaliza la invitación que reciben tus colaboradores.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                    >
                        {previewMode ? (
                            <><Edit3 className="mr-2 h-4 w-4" /> Editar</>
                        ) : (
                            <><Eye className="mr-2 h-4 w-4" /> Vista Previa</>
                        )}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Side */}
                <div className={`space-y-6 ${previewMode ? 'hidden lg:block' : ''}`}>
                    <div className="glass-card p-6 rounded-[32px] border border-white/10 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Asunto del Email</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                                className="rounded-xl border-white/10 bg-white/5 focus:ring-primary focus:border-primary py-6 font-bold"
                                placeholder="Ej: Bienvenido a EBI 360"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="body" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cuerpo del Email (HTML)</Label>
                                <div className="text-[10px] text-primary font-black uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded-md">
                                    Soporta Placeholders
                                </div>
                            </div>
                            <Textarea
                                id="body"
                                value={bodyHtml}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBodyHtml(e.target.value)}
                                className="min-h-[400px] rounded-[24px] border-white/10 bg-white/5 font-mono text-sm leading-relaxed p-6 focus:ring-primary"
                            />
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Atajos (Placeholders)</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                                    <code className="text-primary font-bold text-xs">{"{{full_name}}"}</code>
                                    <span className="text-[10px] text-muted-foreground font-medium">Nombre del empleado</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                                    <code className="text-primary font-bold text-xs">{"{{company_name}}"}</code>
                                    <span className="text-[10px] text-muted-foreground font-medium">Nombre de tu empresa</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                                    <code className="text-primary font-bold text-xs">{"{{login_link}}"}</code>
                                    <span className="text-[10px] text-muted-foreground font-medium">Enlace de acceso</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                                    <code className="text-primary font-bold text-xs">{"{{logo_url}}"}</code>
                                    <span className="text-[10px] text-muted-foreground font-medium">Logo de tu empresa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className={`${!previewMode ? 'hidden lg:block' : ''}`}>
                    <div className="sticky top-6">
                        <div className="relative glass-card rounded-[40px] border border-white/10 shadow-2xl overflow-hidden bg-[#f8fafc]">
                            {/* Browser Bar Mockup */}
                            <div className="bg-white/80 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 max-w-sm mx-auto">
                                    <div className="bg-gray-100 rounded-full h-6 text-[10px] flex items-center px-4 text-gray-400 font-medium">
                                        Asunto: {subject || "Sin asunto"}
                                    </div>
                                </div>
                            </div>

                            {/* Email Content Container */}
                            <div className="p-8 md:p-12 overflow-y-auto max-h-[600px] bg-white">
                                <div
                                    className="prose prose-sm max-w-none text-gray-600"
                                    dangerouslySetInnerHTML={{
                                        __html: bodyHtml
                                            .replace(/{{full_name}}/g, "<strong>Juan Pérez</strong>")
                                            .replace(/{{company_name}}/g, "<strong>Tu Empresa S.A.</strong>")
                                            .replace(/{{logo_url}}/g, '<img src="/logo-bs360.png" style="height: 40px; width: auto;" />')
                                            .replace(/{{login_link}}/g, "#")
                                    }}
                                />
                            </div>

                            {/* Footer Mockup */}
                            <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
                                <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
                                    Enviado de forma segura por EBI 360
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-[11px] text-muted-foreground italic font-medium">
                            * Esta es una previsualización. Los links reales funcionarán al enviar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
