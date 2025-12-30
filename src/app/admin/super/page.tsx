export default async function MinimalDashboard() {
    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Dashboard Minimal</h1>
            <p style={{ color: '#6c757d' }}>Si puedes ver esto, el error estaba en los componentes internos del dashboard.</p>
            <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <p>Base de datos conectada: comprobación básica...</p>
            </div>
        </div>
    );
}
