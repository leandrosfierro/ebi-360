export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: 'red' }}>LAYOUT SUPER ADMIN LOADED</h1>
            <main>{children}</main>
        </div>
    );
}
