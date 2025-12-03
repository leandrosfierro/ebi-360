"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Save, Palette } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    const [primaryColor, setPrimaryColor] = useState("#7e22ce");
    const [secondaryColor, setSecondaryColor] = useState("#3b82f6");
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // TODO: Implement save functionality with server action
        alert("Configuración guardada (funcionalidad pendiente)");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/company/reports"
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Reportes</h2>
                    <p className="text-gray-500">Personaliza la apariencia de tus reportes empresariales.</p>
                </div>
            </div>

            {/* Logo Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Logo de la Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <label
                                htmlFor="logo-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Haz clic para subir logo</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (máx. 2MB)</p>
                                    </div>
                                )}
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="flex-1">
                            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                                <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
                                <div className="bg-white rounded p-4 flex items-center justify-center h-24">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="h-full object-contain" />
                                    ) : (
                                        <p className="text-xs text-gray-400">El logo aparecerá aquí</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Colores de Marca
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Primario
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="#7e22ce"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Se usa en encabezados y elementos principales
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Secundario
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="#3b82f6"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Se usa en gráficos y elementos de acento
                            </p>
                        </div>
                    </div>

                    {/* Color Preview */}
                    <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-4">Vista Previa de Colores</p>
                        <div className="bg-white rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-16 w-16 rounded-lg shadow-sm"
                                    style={{ backgroundColor: primaryColor }}
                                />
                                <div>
                                    <p className="font-medium" style={{ color: primaryColor }}>
                                        Color Primario
                                    </p>
                                    <p className="text-sm text-gray-500">Encabezados y títulos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-16 w-16 rounded-lg shadow-sm"
                                    style={{ backgroundColor: secondaryColor }}
                                />
                                <div>
                                    <p className="font-medium" style={{ color: secondaryColor }}>
                                        Color Secundario
                                    </p>
                                    <p className="text-sm text-gray-500">Gráficos y detalles</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/admin/company/reports"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                    Cancelar
                </Link>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
}
