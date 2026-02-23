
// export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
    return [{ id: '123' }, { id: '456' }];
}

export default async function DebugPage(props: any) {
    let id = "initializing...";
    try {
        const params = await props.params;
        id = params?.id || "missing";
    } catch (e) {
        id = "error_reading_params";
    }

    return (
        <div style={{ backgroundColor: 'black', color: '#00ff00', padding: '40px', fontFamily: 'monospace' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>DEBUG ROUTE ACTIVE (v1.7 - SSG)</h1>
            <p><strong>ID Received:</strong> {id}</p>
            <p><strong>Time:</strong> {new Date().toISOString()}</p>
            <p><strong>Render Mode:</strong> Server Component</p>
        </div>
    );
}
