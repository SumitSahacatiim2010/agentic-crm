import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { full_name, email, product_interest, source_channel, status, lead_rating } = body;

        if (!full_name) return NextResponse.json({ error: 'full_name is required' }, { status: 400 });

        const { data, error } = await insforge.database.from('leads').insert([{
            full_name,
            email: email || null,
            product_interest: product_interest || 'Unknown',
            source_channel: source_channel || 'Web',
            status: status || 'New',
            lead_rating: lead_rating || 'Warm'
        }]).select('id').single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ id: data?.id }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
