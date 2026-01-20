import { createClient } from "@/lib/supabase/server";
import CompanyAdminLayoutClient from "./layout-client";
import { isSuperAdminEmail } from "@/config/super-admins";

export default async function CompanyAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRoles: string[] = [];
    let activeRole = "";
    let companyBranding = null;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('roles, active_role, role, company_id')
            .eq('id', user.id)
            .single();

        const isMaster = isSuperAdminEmail(user.email || '');

        userRoles = profile?.roles || (profile?.role ? [profile.role] : ['employee']);
        activeRole = profile?.active_role || profile?.role || 'employee';

        if (isMaster) {
            if (!userRoles.includes('super_admin')) {
                userRoles = ['super_admin', 'company_admin', 'employee'];
            }
            if (activeRole !== 'super_admin' && activeRole !== 'company_admin') {
                activeRole = 'super_admin';
            }
        }

        if (profile?.company_id) {
            const { data: company } = await supabase
                .from('companies')
                .select('name, logo_url, primary_color, secondary_color')
                .eq('id', profile.company_id)
                .single();
            companyBranding = company;
        } else if (isMaster) {
            // Master Admins get a default "Global" view if no company assigned
            companyBranding = {
                name: "Bs360 Global",
                logo_url: null,
                primary_color: "#7e22ce",
                secondary_color: null
            };
        }
    }

    return (
        <CompanyAdminLayoutClient
            userRoles={userRoles}
            activeRole={activeRole}
            companyBranding={companyBranding}
        >
            {children}
        </CompanyAdminLayoutClient>
    );
}
