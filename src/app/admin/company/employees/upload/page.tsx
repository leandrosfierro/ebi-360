"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { bulkUploadUsers } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface ParsedUser {
    email: string;
    full_name: string;
    department?: string;
}

export default function BulkUploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedUser[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ success: number; errors: string[] } | null>(null);

    const downloadCsvTemplate = () => {
        const csvContent = "email,full_name,department\njuan.perez@empresa.com,Juan Pérez,Ventas\nmaria.gomez@empresa.com,María Gómez,Marketing";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_usuarios_ebi360.csv";
        a.click();
    };

    const downloadXlsxTemplate = () => {
        const data = [
            { email: "juan.perez@empresa.com", full_name: "Juan Pérez", department: "Ventas" },
            { email: "maria.gomez@empresa.com", full_name: "María Gómez", department: "Marketing" }
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Colaboradores");

        // Use XLSX.writeFile for browser download
        XLSX.writeFile(workbook, "plantilla_usuarios_ebi360.xlsx");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setErrors([]);
        setParsedData([]);
        setUploadComplete(false);

        const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "csv") {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    validateAndSetData(results.data as ParsedUser[]);
                },
                error: (error) => {
                    setErrors([`Error al leer CSV: ${error.message}`]);
                },
            });
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as ParsedUser[];
                validateAndSetData(json);
            };
            reader.readAsArrayBuffer(selectedFile);
        } else {
            setErrors(["Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)"]);
        }
    };

    const validateAndSetData = (data: ParsedUser[]) => {
        const validationErrors: string[] = [];
        const validData: ParsedUser[] = [];

        data.forEach((row, index) => {
            if (!row.email || !row.full_name) {
                validationErrors.push(`Fila ${index + 2}: Faltan campos requeridos (email o full_name)`);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                validationErrors.push(`Fila ${index + 2}: Email inválido (${row.email})`);
                return;
            }

            validData.push({
                email: row.email.trim().toLowerCase(),
                full_name: row.full_name.trim(),
                department: row.department?.trim(),
            });
        });

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
        }

        setParsedData(validData);
    };

    const handleSubmit = async () => {
        if (parsedData.length === 0) return;

        setIsProcessing(true);
        const result = await bulkUploadUsers(parsedData);
        setIsProcessing(false);

        if (result.success) {
            setUploadComplete(true);
            setUploadResults({
                success: result.created || 0,
                errors: result.errors || [],
            });
        } else {
            setErrors([result.error || "Error desconocido"]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/company/employees"
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Carga Masiva de Usuarios</h2>
                    <p className="text-gray-500">Sube un archivo CSV o Excel con la lista de colaboradores.</p>
                </div>
            </div>

            {/* Template Download */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 tracking-tight">¿Primera vez?</h3>
                        <p className="text-sm text-blue-700/80 mt-1 font-medium">
                            Descarga la plantilla en tu formato preferido para asegurarte de que el sistema reconozca todos los datos correctamente.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={downloadCsvTemplate}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                Descargar Plantilla CSV
                            </button>
                            <button
                                onClick={downloadXlsxTemplate}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-200"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Descargar Plantilla Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            {!uploadComplete && (
                <div className="rounded-[32px] border-2 border-dashed border-gray-200 bg-white/50 p-16 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                            <Upload className="h-10 w-10 text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-xl font-black text-gray-900 tracking-tight">
                            {file ? file.name : "Subir archivo de colaboradores"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            Arrastra tu archivo <span className="text-blue-600 font-bold">Excel (.xlsx)</span> o <span className="text-blue-600 font-bold">CSV</span> aquí
                        </p>
                    </label>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-red-900">Errores de Validación</h3>
                            <ul className="mt-2 text-sm text-red-700 space-y-1">
                                {errors.slice(0, 10).map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                                {errors.length > 10 && (
                                    <li className="font-medium">... y {errors.length - 10} errores más</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && !uploadComplete && (
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-medium text-gray-900">
                            Vista Previa ({parsedData.length} usuarios)
                        </h3>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre Completo</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Departamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parsedData.slice(0, 50).map((user, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{user.email}</td>
                                        <td className="px-4 py-3 text-gray-900">{user.full_name}</td>
                                        <td className="px-4 py-3 text-gray-500">{user.department || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 50 && (
                            <div className="p-4 text-center text-sm text-gray-500 border-t">
                                Mostrando 50 de {parsedData.length} usuarios
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setFile(null);
                                setParsedData([]);
                                setErrors([]);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing || errors.length > 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Subir {parsedData.length} Usuarios
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {uploadComplete && uploadResults && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                        ¡Carga Completada!
                    </h3>
                    <p className="text-green-700 mb-4">
                        Se crearon {uploadResults.success} usuarios exitosamente.
                    </p>
                    {uploadResults.errors.length > 0 && (
                        <div className="mt-4 text-left bg-white rounded-lg p-4">
                            <p className="font-medium text-gray-900 mb-2">Errores:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {uploadResults.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={() => {
                                setFile(null);
                                setParsedData([]);
                                setUploadComplete(false);
                                setUploadResults(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg"
                        >
                            Subir Otro Archivo
                        </button>
                        <Link
                            href="/admin/company/employees"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Ver Colaboradores
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
