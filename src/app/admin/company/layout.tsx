import { createClient } from "@/lib/supabase/server";
import CompanyAdminLayoutClient from "./layout-client";

export default async function CompanyAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRoles: string[] = [];
    let activeRole = "";

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('roles, active_role, role')
            .eq('id', user.id)
            .single();

        userRoles = profile?.roles || [profile?.role || 'employee'];
        activeRole = profile?.active_role || profile?.role || 'employee';
    }

    return (
        <CompanyAdminLayoutClient
            userRoles={userRoles}
            activeRole={activeRole}
        >
            {children}
        </CompanyAdminLayoutClient>
    );
}
