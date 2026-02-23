// src/app/api/complaint/upsert-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { case_id, ...rest } = body;
        if (!case_id) return NextResponse.json({ error: 'case_id required' }, { status: 400 });

        const payload: Record<string, unknown> = {
            case_id,
            updated_at: new Date().toISOString(),
        };
        if (rest.case_type) payload.case_type = rest.case_type;
        if (rest.severity) payload.severity = rest.severity;
        if (rest.root_cause) payload.root_cause = rest.root_cause;
        if (rest.sentiment) payload.sentiment = rest.sentiment;
        if (rest.regulatory_body) payload.regulatory_body = rest.regulatory_body;
        if (rest.ombudsman_ref !== undefined) payload.ombudsman_ref = rest.ombudsman_ref;
        if (rest.ombudsman_deadline !== undefined) payload.ombudsman_deadline = rest.ombudsman_deadline;
        if (rest.remediation_required !== undefined) payload.remediation_required = rest.remediation_required;
        if (rest.remediation_amount !== undefined) payload.remediation_amount = rest.remediation_amount;

        // Upsert — insert or update on conflict
        const { error } = await insforge.database.from('case_complaint_details').upsert([payload], { onConflict: 'case_id' });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Also update is_regulatory on service_cases if case_type is regulatory
        if (rest.case_type === 'regulatory_complaint') {
            await insforge.database.from('service_cases').update({ is_regulatory: true }).eq('case_id', case_id);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
