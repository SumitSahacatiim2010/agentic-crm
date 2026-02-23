import { NextResponse } from 'next/server';
import { getLeadsWithDetails } from '@/lib/crm-service';

export async function GET() {
    try {
        const data = await getLeadsWithDetails();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
