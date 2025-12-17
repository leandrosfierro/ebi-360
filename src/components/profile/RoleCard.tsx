"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { switchRole } from "@/lib/actions";
import { useState } from "react";

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    role: 'super_admin' | 'company_admin' | 'employee';
    active: boolean;
    href: string;
}

export function RoleCard({ title, description, icon, role, active, href }: RoleCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSwitch = async () => {
        if (active) {
            router.push(href);
            return;
        }

        setIsLoading(true);
        try {
            const result = await switchRole(role);

            if (result.error) {
                alert(`Error: ${result.error}`);
                setIsLoading(false);
            } else {
                // Success - Forced Hard Redirect to bypass stale cache
                // Adding a dummy param to ensure browser treats it as fresh navigation
                const targetUrl = href.includes('?') ? `${href}&t=${Date.now()}` : `${href}?t=${Date.now()}`;
                window.location.href = targetUrl;
            }
        } catch (error) {
            console.error("Switch error:", error);
            setIsLoading(false);
        }
    };

    return (
        <Card className={`relative overflow-hidden transition-all hover:shadow-md ${active ? 'border-purple-500 border-2 bg-purple-50/50' : 'border-gray-200'
            }`}>
            {active && (
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 rounded-full bg-purple-600 px-2 py-1 text-xs font-medium text-white">
                        <Check className="h-3 w-3" />
                        Activo
                    </div>
                </div>
            )}

            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {icon}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>

                        <Button
                            onClick={handleSwitch}
                            disabled={isLoading}
                            className={`mt-4 ${active
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-900 hover:bg-gray-800'
                                }`}
                        >
                            {isLoading ? (
                                "Cambiando..."
                            ) : active ? (
                                <>
                                    Ir al Panel
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                "Activar y Acceder"
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
