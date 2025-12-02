import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, TrendingUp, AlertCircle } from "lucide-react";

export default function CompanyAdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard de Empresa</h2>
                <p className="text-gray-500">Resumen del estado de bienestar de tu organización.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-muted-foreground">Total registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participación</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground">105 encuestas completadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Índice de Bienestar</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7.2</div>
                        <p className="text-xs text-muted-foreground">Promedio general</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Riesgo Detectado</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">12%</div>
                        <p className="text-xs text-muted-foreground">Colaboradores en riesgo alto</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Evolución del Bienestar</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                            <p className="text-sm text-gray-400">Gráfico de evolución temporal aquí</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Desglose por Dominio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-full flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Físico</p>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "75%" }}></div>
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold">7.5</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-full flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Emocional</p>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-purple-500" style={{ width: "60%" }}></div>
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold">6.0</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-full flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Social</p>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-green-500" style={{ width: "82%" }}></div>
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold">8.2</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
