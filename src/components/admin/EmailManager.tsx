"use client";

import { useState } from "react";
import { EmailTemplate, EmailLog, updateEmailTemplate } from "@/lib/email-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Loader2, Save, Send } from "lucide-react";
import { formatDate } from "@/lib/utils"; // Assuming utils exists, otherwise I'll mock or format inline

interface EmailManagerProps {
    initialTemplates: EmailTemplate[];
    initialLogs: EmailLog[];
}

export function EmailManager({ initialTemplates, initialLogs }: EmailManagerProps) {
    const [templates, setTemplates] = useState(initialTemplates);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplates[0]?.id || "");
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const [subject, setSubject] = useState(selectedTemplate?.subject || "");
    const [body, setBody] = useState(selectedTemplate?.body_html || "");

    // Logs state
    const [logs] = useState(initialLogs); // For now static, could use pagination

    const handleTemplateChange = (value: string) => {
        const template = templates.find(t => t.id === value);
        if (template) {
            setSelectedTemplateId(value);
            setSubject(template.subject);
            setBody(template.body_html);
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsLoading(true);
        const result = await updateEmailTemplate(selectedTemplate.id, subject, body);
        if (result.success) {
            // Update local state
            setTemplates(prev => prev.map(t =>
                t.id === selectedTemplate.id ? { ...t, subject, body_html: body } : t
            ));
            alert("Plantilla guardada correctamente");
        } else {
            alert("Error al guardar: " + result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Emails</h1>

            <Tabs defaultValue="templates">
                <TabsList>
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                    <TabsTrigger value="logs">Historial de Envíos</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Editor de Plantillas</CardTitle>
                            <CardDescription>
                                Personaliza el contenido de los correos automáticos del sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Seleccionar Plantilla</Label>
                                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una plantilla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTemplate && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Asunto</Label>
                                        <Input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Contenido</Label>
                                        <RichTextEditor
                                            content={body}
                                            onChange={setBody}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={handleSave} disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Envíos</CardTitle>
                            <CardDescription>
                                Registro de los últimos correos enviados por el sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium">
                                        <tr>
                                            <th className="p-3 border-b">Fecha</th>
                                            <th className="p-3 border-b">Destinatario</th>
                                            <th className="p-3 border-b">Tipo</th>
                                            <th className="p-3 border-b">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                                    No hay registros aún.
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map(log => (
                                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 text-gray-500">
                                                        {new Date(log.sent_at).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 font-medium">{log.to_email}</td>
                                                    <td className="p-3 text-gray-600">
                                                        {log.template_type === 'invite_super_admin' ? 'Invitación Super Admin' :
                                                            log.template_type === 'invite_company_admin' ? 'Invitación Company Admin' :
                                                                log.template_type}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.status === 'sent'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {log.status === 'sent' ? 'Enviado' : 'Fallido'}
                                                        </span>
                                                        {log.error_message && (
                                                            <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={log.error_message}>
                                                                {log.error_message}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
