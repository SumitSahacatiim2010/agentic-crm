// src/app/api/leads/create/route.ts
// BUG-024 fix: correct column names + add rating/source fields
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { full_name, email, product_interest, source_channel, source_metadata, lead_status, rating } = body;

        if (!full_name) return NextResponse.json({ error: 'full_name is required' }, { status: 400 });

        const { data, error } = await insforge.database.from('leads').insert([{
            full_name,
            email: email || null,
            product_interest: product_interest || 'Unknown',
            source_channel: source_channel || 'web',
            lead_status: lead_status || 'new',
            rating: rating || 'warm',
            source: source_channel || 'web',
        }]).select('lead_id').limit(1);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ lead_id: (data as any)?.[0]?.lead_id }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
