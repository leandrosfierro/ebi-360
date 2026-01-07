import { ArrowLeft, Upload, Save, Palette, Type, Settings } from "lucide-react";
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
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                        <Palette className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Branding & Estilo</h2>
                        <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                            <Settings className="h-4 w-4 text-primary" />
                            Personaliza la identidad visual de tu empresa en la plataforma.
                        </p>
                    </div>
                </div>
            </div>

            <SettingsForm company={company} />
        </div>
    );
}
