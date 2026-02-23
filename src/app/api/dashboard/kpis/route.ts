import { NextResponse } from 'next/server';
import { getExecKpis } from '@/lib/crm-service';

export async function GET() {
    try {
        const kpis = await getExecKpis();
        return NextResponse.json(kpis);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
