// src/app/api/edge-proxy/[slug]/route.ts
// Server-side proxy so the browser can invoke InsForge edge functions via the SDK.
// Used exclusively by the P1 Validation UI EdgeTestPanel.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const simulateError = req.headers.get('x-simulate-error');

    let body: Record<string, unknown> = {};
    try {
        body = await req.json();
    } catch { /* body stays empty */ }

    const headers: Record<string, string> = {};
    if (simulateError) headers['x-simulate-error'] = simulateError;

    try {
        const { data, error } = await insforge.functions.invoke(slug, { body, headers });
        if (error) {
            return NextResponse.json({ error: String(error) }, { status: 502 });
        }
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Proxy failed', detail: String(err) }, { status: 500 });
    }
}
