import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { offer_id, opportunity_id } = await req.json();
        if (!offer_id || !opportunity_id) return NextResponse.json({ error: 'offer_id, opportunity_id required' }, { status: 400 });

        await insforge.database.from('credit_offers').update({ opportunity_id }).eq('offer_id', offer_id);

        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
