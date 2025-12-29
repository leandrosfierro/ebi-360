"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Super Admin Route Error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 rounded-full bg-rose-500/10 p-4 ring-8 ring-rose-500/5">
                <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-foreground">
                Algo salió mal en el panel
            </h2>
            
            <p className="mb-8 max-w-md text-muted-foreground">
                Ocurrió un error al cargar esta sección. Esto puede deberse a un problema de conexión o un error inesperado en el servidor.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <RotateCcw className="h-5 w-5" />
                    Intentar de nuevo
                </button>
                
                <button
                    onClick={() => window.location.href = "/"}
                    className="rounded-2xl bg-white/5 border border-white/10 px-6 py-3.5 font-bold text-foreground hover:bg-white/10 transition-all"
                >
                    Volver al Home
                </button>
            </div>

            {process.env.NODE_ENV !== "production" && (
                <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Detalles Técnicos (Debug):</p>
                    <pre className="overflow-auto text-[10px] text-rose-400">
                        {error.name}: {error.message}
                        {"\n\n"}
                        Stack: {error.stack}
                        {"\n\n"}
                        Digest: {error.digest}
                    </pre>
                </div>
            )}
        </div>
    );
}
