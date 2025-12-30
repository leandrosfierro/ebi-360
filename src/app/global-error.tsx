"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <html lang="es">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-mesh-gradient">
                    <div className="glass-card p-12 rounded-[32px] max-w-xl">
                        <h2 className="text-3xl font-bold text-rose-500 mb-4">Error Crítico de Aplicación</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Lo sentimos, ha ocurrido un error inesperado que impide que la aplicación cargue.
                        </p>

                        <div className="bg-black/5 rounded-2xl p-6 text-left mb-8 font-mono text-sm overflow-auto max-h-60 border border-black/5">
                            <p className="font-bold text-rose-500 mb-2">Detalles:</p>
                            <p className="text-foreground">{error.name}: {error.message}</p>
                            {error.digest && <p className="mt-2 text-primary">Digest ID: {error.digest}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => reset()}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => window.location.href = "/"}
                                className="bg-white/10 text-foreground px-8 py-4 rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all"
                            >
                                Ir al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
