"use client";

import { useState } from "react";
import { Upload, Save, Palette, Type, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { updateCompanyBranding } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
    company: any;
}

const FONTS = [
    { value: 'Inter', label: 'Inter (Moderno)' },
    { value: 'Roboto', label: 'Roboto (Limpio)' },
    { value: 'Montserrat', label: 'Montserrat (Audaz)' },
    { value: 'Open Sans', label: 'Open Sans (Amigable)' },
    { value: 'Lato', label: 'Lato (Profesional)' },
    { value: 'Poppins', label: 'Poppins (Elegante)' },
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

        try {
            const result = await updateCompanyBranding(formData);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("Configuración de marca actualizada exitosamente");
                router.refresh();
                setTimeout(() => setSuccess(""), 4000);
            }
        } catch (err: any) {
            setError("Error al procesar la solicitud");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Status Messages */}
            {error && (
                <div className="rounded-[24px] bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3 text-rose-500 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-bold tracking-tight">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3 text-emerald-500 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-bold tracking-tight">{success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Colors & Typography */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Identity & Colors Section */}
                    <div className="glass-card rounded-[32px] p-8 border border-white/10 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Palette className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-wider italic mb-1">Identidad Visual</h3>
                                <p className="text-sm text-muted-foreground font-medium">Define los colores que representarán a tu empresa.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Color Principal</Label>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/10 group hover:border-primary/30 transition-all duration-300">
                                        <div
                                            className="h-14 w-14 rounded-2xl shadow-lg shrink-0 cursor-pointer relative overflow-hidden ring-2 ring-white/10"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="bg-transparent border-none text-lg font-black tracking-tighter uppercase p-0 h-auto focus-visible:ring-0"
                                            />
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Acabado Principal</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Color de Acento</Label>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/10 group hover:border-secondary/30 transition-all duration-300">
                                        <div
                                            className="h-14 w-14 rounded-2xl shadow-lg shrink-0 cursor-pointer relative overflow-hidden ring-2 ring-white/10"
                                            style={{ backgroundColor: secondaryColor }}
                                        >
                                            <input
                                                type="color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="bg-transparent border-none text-lg font-black tracking-tighter uppercase p-0 h-auto focus-visible:ring-0"
                                            />
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Detalles & Gráficos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-4">Tipografía Corporativa (Reportes)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {FONTS.map((f) => (
                                        <button
                                            key={f.value}
                                            onClick={() => setFont(f.value)}
                                            className={`p-4 rounded-[20px] border transition-all text-left group ${font === f.value
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                }`}
                                        >
                                            <p className="text-sm font-black tracking-tight" style={{ fontFamily: f.value }}>{f.label}</p>
                                            <p className={`text-[10px] font-bold ${font === f.value ? 'text-white/70' : 'text-muted-foreground/50'}`}>Abc 123</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div className="glass-card rounded-[32px] p-8 border border-white/10 shadow-xl overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-wider italic mb-1">Logotipo</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Sube el logo oficial de tu organización.</p>
                                </div>
                                <div className="space-y-4">
                                    <label
                                        htmlFor="logo-upload"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-[32px] cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="h-6 w-6 text-primary" />
                                            </div>
                                            <p className="mb-2 text-sm text-foreground font-black uppercase tracking-tight">Cargar Archivo</p>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">PNG o JPG (Máx 2MB)</p>
                                        </div>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="w-full md:w-64 space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Vista Previa Logo</Label>
                                <div className="h-48 rounded-[32px] bg-white border border-gray-100 p-8 flex items-center justify-center shadow-inner relative group overflow-hidden">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Sin imagen</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Interactive Preview */}
                <div className="space-y-6">
                    <div className="sticky top-8">
                        <div className="glass-card rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <p className="text-xs font-black uppercase tracking-widest text-primary italic" style={{ color: primaryColor }}>Simulador EBI 360</p>
                            </div>

                            <div className="p-8 space-y-8 bg-mesh-gradient">
                                {/* Header Preview */}
                                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                    <div className="h-8 w-24 rounded bg-white/10 animate-pulse flex items-center justify-center overflow-hidden">
                                        {logoPreview && <img src={logoPreview} className="max-h-6 w-auto" />}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                                        <div className="h-6 w-16 rounded-full" style={{ backgroundColor: primaryColor + '20' }} />
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="h-4 w-1/2 rounded bg-foreground/10" style={{ fontFamily: font }} />
                                        <div className="h-8 w-full rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center">
                                                <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: i === 1 ? primaryColor : (i === 2 ? secondaryColor : 'white/30') }} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3" style={{ backgroundColor: secondaryColor }} />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <div className="h-2 w-12 bg-white/10 rounded" />
                                            <div className="h-2 w-8 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Preview */}
                                <div className="glass-card p-6 rounded-[24px] border border-white/20 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 h-20 w-20 transform translate-x-8 -translate-y-8 rounded-full opacity-20 blur-xl" style={{ backgroundColor: secondaryColor }} />
                                    <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Reporte Mensual</p>
                                    <p className="text-2xl font-black italic tracking-tighter" style={{ color: primaryColor, fontFamily: font }}>BIENESTAR 360</p>
                                    <div className="mt-6 flex justify-end">
                                        <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: primaryColor }}>Descargar PDF</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Vista Previa en Tiempo Real</p>
                    </div>
                </div>
            </div>

            {/* Final Action Bar */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-16 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-lg group"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Guardando Identidad...
                        </>
                    ) : (
                        <>
                            <Save className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                            Actualizar Branding
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
