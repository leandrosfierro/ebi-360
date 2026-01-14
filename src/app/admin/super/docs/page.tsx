'use client';

import { useState } from 'react';
import { BookOpen, FileText, Download, ExternalLink } from 'lucide-react';

const documents = [
    {
        id: 'indice',
        title: 'Índice General',
        subtitle: 'Navegación y Guía de Uso',
        description: 'Punto de partida para navegar toda la documentación. Incluye checklist completo y consejos por rol.',
        icon: '📑',
        color: '#8b5cf6',
        pages: 15,
        time: '10-15 min',
        audience: 'Todos',
        file: '/docs/Sistema-Encuestas-INDICE.html'
    },
    {
        id: 'resumen',
        title: 'Resumen Ejecutivo',
        subtitle: 'Visión General del Sistema',
        description: 'Propuesta en 3 conceptos clave, modelo de datos simplificado e interfaces principales.',
        icon: '📊',
        color: '#6366f1',
        pages: 20,
        time: '15-20 min',
        audience: 'Stakeholders',
        file: '/docs/Sistema-Encuestas-RESUMEN.html'
    },
    {
        id: 'diseno',
        title: 'Diseño Técnico',
        subtitle: 'Arquitectura y Especificaciones',
        description: 'Documento técnico completo con modelo de datos SQL, arquitectura, flujos de trabajo e interfaces detalladas.',
        icon: '🏗️',
        color: '#7c3aed',
        pages: 60,
        time: '45-60 min',
        audience: 'Desarrolladores',
        file: '/docs/Sistema-Encuestas-DISEÑO.html'
    },
    {
        id: 'estrategia',
        title: 'Estrategia y Backlog',
        subtitle: 'Génesis y Roadmap Técnico',
        description: 'Documentación integral para el Administrador. Incluye el origen del proyecto, flujos de usuario, reglas de negocio y el backlog evolutivo desde el día 0.',
        icon: '🎯',
        color: '#f59e0b',
        pages: 35,
        time: '30-45 min',
        audience: 'Administradores',
        file: '/docs/admin-docs/EBI360-Estrategia-y-Backlog.html'
    },
    {
        id: 'excel',
        title: 'Guía de Excel',
        subtitle: 'Formato y Validaciones',
        description: 'Manual completo del formato Excel para carga de encuestas. Incluye estructura, validaciones, errores comunes, ejemplos y mejores prácticas.',
        icon: '📋',
        color: '#a855f7',
        pages: 25,
        time: '20-30 min',
        audience: 'Super Admins',
        file: '/docs/Sistema-Encuestas-EXCEL.html'
    }
];

export default function DocsPage() {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const handleOpenDoc = (file: string) => {
        window.open(file, '_blank');
    };

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="glass-card p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        < BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Sistema de Encuestas Modulares
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Documentación Técnica Completa
                        </p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-foreground/80">
                        <strong className="text-blue-400">💡 Nota:</strong> Esta documentación describe el sistema modular de gestión de encuestas que permitirá administrar múltiples encuestas dinámicas, asignarlas por empresa y país, y cargarlas mediante archivos Excel.
                    </p>
                </div>
            </div>

            {/* Documentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleOpenDoc(doc.file)}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                                style={{ background: `${doc.color}20`, border: `2px solid ${doc.color}40` }}
                            >
                                {doc.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-purple-400 transition-colors">
                                    {doc.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {doc.subtitle}
                                </p>
                                <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                                    {doc.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-foreground/60">
                                        📄 {doc.pages} páginas
                                    </span>
                                    <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-foreground/60">
                                        ⏱️ {doc.time}
                                    </span>
                                    <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-foreground/60">
                                        👥 {doc.audience}
                                    </span>
                                </div>

                                <button
                                    className="w-full px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${doc.color} 0%, #764ba2 100%)`,
                                        color: 'white'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDoc(doc.file);
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir Documento
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Características del Sistema */}
            <div className="glass-card p-6 border border-white/10">
                <h2 className="text-xl font-bold text-foreground mb-4">
                    ✨ Características del Sistema
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Encuestas Dinámicas</p>
                            <p className="text-xs text-muted-foreground">Almacenadas en base de datos, modificables sin código</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Carga mediante Excel</p>
                            <p className="text-xs text-muted-foreground">Sin necesidad de conocimientos técnicos</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Múltiples Encuestas</p>
                            <p className="text-xs text-muted-foreground">Soporte para varias encuestas por empresa</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Encuestas Regulatorias</p>
                            <p className="text-xs text-muted-foreground">Por país (NOM-035, etc.)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Versionado Automático</p>
                            <p className="text-xs text-muted-foreground">Historial completo de cambios</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Asignación Flexible</p>
                            <p className="text-xs text-muted-foreground">Por empresa, plan y configuración personalizada</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
