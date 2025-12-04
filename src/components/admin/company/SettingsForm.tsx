"use client";

import { useState } from "react";
import { Upload, Save, Palette, Type } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCompanyBranding } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    company: any;
}

const FONTS = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Montserrat', label: 'Montserrat (Bold)' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)' },
    { value: 'Lato', label: 'Lato (Professional)' },
    { value: 'Poppins', label: 'Poppins (Elegant)' },
];

export function SettingsForm({ company }: SettingsFormProps) {
    const router = useRouter();
    const [primaryColor, setPrimaryColor] = useState(company?.primary_color || "#7e22ce");
    const [secondaryColor, setSecondaryColor] = useState(company?.secondary_color || "#3b82f6");
    const [font, setFont] = useState(company?.font || "Inter");
    const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append('primaryColor', primaryColor);
        formData.append('secondaryColor', secondaryColor);
        formData.append('font', font);

        if (logoFile) {
            formData.append('logo', logoFile);
        }

        const result = await updateCompanyBranding(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Configuración guardada correctamente");
            router.refresh();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        }

        setIsLoading(false);
    };

    return (
        <>
            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <p className="text-sm text-green-600">✓ {success}</p>
                </div>
            )}

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
                                    <img src={logoPreview} alt="Logo preview" className="h-full object-contain p-2" />
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

            {/* Typography */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Tipografía
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fuente para Reportes
                        </label>
                        <select
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            {FONTS.map((f) => (
                                <option key={f.value} value={f.value}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Esta fuente se usará en los reportes PDF exportados
                        </p>
                    </div>

                    {/* Font Preview */}
                    <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-4">Vista Previa de Tipografía</p>
                        <div className="bg-white rounded-lg p-6">
                            <p className="text-2xl mb-2" style={{ fontFamily: font }}>
                                {company?.name || "Nombre de la Empresa"}
                            </p>
                            <p className="text-sm text-gray-600" style={{ fontFamily: font }}>
                                Este es un ejemplo de cómo se verá el texto en los reportes con la fuente seleccionada.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/admin/company/reports"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
                >
                    Cancelar
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </>
    );
}
