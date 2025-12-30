import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    if (error || !user) {
        redirect("/login");
    }

    // Checking if the user has super_admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.role !== 'super_admin') {
        redirect("/perfil");
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
            <aside style={{ width: '280px', borderRight: '1px solid #dee2e6', padding: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>EBI 360 Admin</h2>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}>
                            <a href="/admin/super" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Dashboard</a>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <a href="/" style={{ textDecoration: 'none', color: '#6c757d' }}>Volver al Home</a>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '40px' }}>
                {children}
            </main>
        </div>
    );
}
