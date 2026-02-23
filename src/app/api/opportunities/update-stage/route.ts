// src/app/api/opportunities/update-stage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { opportunity_id, stage, win_loss_reason, closed_at, final_value, notes } = await req.json();
        if (!opportunity_id || !stage) return NextResponse.json({ error: 'opportunity_id and stage required' }, { status: 400 });

        const updates: Record<string, unknown> = { pipeline_stage: stage };
        if (win_loss_reason) {
            if (stage === 'Closed-Won' || stage === 'Completed') updates.win_reason = win_loss_reason;
            else updates.loss_reason = win_loss_reason;
        }
        if (closed_at) updates.updated_at = closed_at;
        if (final_value !== undefined) updates.deal_value = final_value;

        const { error } = await insforge.database.from('opportunities').update(updates).eq('id', opportunity_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
