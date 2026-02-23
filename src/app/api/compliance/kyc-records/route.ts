import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer_id, documents } = body;

        // Mock KYC record creation

        return NextResponse.json({ success: true, customer_id, status: 'verified', docs_saved: documents?.length || 0 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
