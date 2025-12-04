import { ArrowLeft, Upload, Save, Palette, Type } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/company/SettingsForm";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Unauthorized</div>;
    }

    // Get company branding
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile?.company_id)
        .single();

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

            <SettingsForm company={company} />
        </div>
    );
}
