// src/app/api/compliance/log-screen/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { party_id, screen_result, risk_score, flags, screened_at } = await req.json();
        if (!party_id) return NextResponse.json({ error: 'party_id required' }, { status: 400 });
        const { error } = await insforge.database.from('sanctions_logs').insert([{
            party_id, screen_result, risk_score, flags: flags || [], screened_at: screened_at || new Date().toISOString()
        }]);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
