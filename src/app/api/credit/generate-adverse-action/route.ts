import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { generateAdverseActionText } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const { application_id, decline_codes } = await req.json();
        if (!application_id || !decline_codes?.length) return NextResponse.json({ error: 'application_id, decline_codes required' }, { status: 400 });

        const text = generateAdverseActionText(decline_codes);
        const { data, error } = await insforge.database.from('credit_adverse_actions').insert([{
            application_id, decline_codes, reason_text: text.reason, bureau_disclosure: text.bureau, ecoa_notice: text.ecoa,
        }]).select('action_id').limit(1);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ action_id: (data as any)?.[0]?.action_id, ...text }, { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
