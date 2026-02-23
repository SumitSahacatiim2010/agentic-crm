import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET() {
    try {
        const { data } = await insforge.database
            .from('compliance_dashboard_metrics')
            .select('*')
            .limit(1);
        return NextResponse.json((data as any)?.[0] ?? {});
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
