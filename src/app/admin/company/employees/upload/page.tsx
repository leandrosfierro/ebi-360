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

    const downloadTemplate = () => {
        const csvContent = "email,full_name,department\njuan.perez@empresa.com,Juan Pérez,Ventas\nmaria.gomez@empresa.com,María Gómez,Marketing";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_usuarios.csv";
        a.click();
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
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-medium text-blue-900">¿Primera vez?</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Descarga la plantilla para asegurarte de usar el formato correcto.
                        </p>
                        <button
                            onClick={downloadTemplate}
                            className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            <Download className="h-4 w-4" />
                            Descargar Plantilla CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            {!uploadComplete && (
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center hover:border-blue-400 transition-colors">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900">
                            {file ? file.name : "Arrastra un archivo o haz clic para seleccionar"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">CSV, XLSX o XLS (máx. 5MB)</p>
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
