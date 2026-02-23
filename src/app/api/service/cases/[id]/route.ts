import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const body = await request.json();

        // Separate fields for `service_cases` vs `case_complaint_details`
        const casePayload: any = {};
        const complaintPayload: any = {};

        // Case update fields (from T4.1.3, T4.1.4)
        if (body.status !== undefined) casePayload.status = body.status;
        if (body.sla_breached !== undefined) casePayload.sla_breached = body.sla_breached;
        if (body.resolved_at !== undefined) casePayload.resolved_at = body.resolved_at;
        if (body.closed_at !== undefined) casePayload.closed_at = body.closed_at;

        // SLA breach auto-marks escalation logic if needed, but the prompt says 
        // "At 0: PUT sla_breached=true"

        // Case complaint details fields (from T4.1.2)
        const classificationKeys = [
            'case_type', 'severity', 'root_cause', 'sentiment',
            'regulatory_body', 'ombudsman_ref', 'ombudsman_deadline',
            'remediation_required', 'remediation_amount'
        ];

        let hasComplaintFields = false;
        for (const key of classificationKeys) {
            if (body[key] !== undefined) {
                complaintPayload[key] = body[key];
                hasComplaintFields = true;
            }
        }

        // Update service_cases if needed
        if (Object.keys(casePayload).length > 0) {
            casePayload.updated_at = new Date().toISOString();
            const { error: caseErr } = await insforge.database
                .from('service_cases')
                .update(casePayload)
                .eq('case_id', id);

            if (caseErr) return NextResponse.json({ error: caseErr.message }, { status: 500 });
        }

        // Update case_complaint_details if needed
        if (hasComplaintFields) {
            complaintPayload.case_id = id;
            complaintPayload.updated_at = new Date().toISOString();

            const { error: compErr } = await insforge.database
                .from('case_complaint_details')
                .upsert([complaintPayload], { onConflict: 'case_id' });

            if (compErr) return NextResponse.json({ error: compErr.message }, { status: 500 });

            // If it's a regulatory complaint, automatically flag the case
            if (complaintPayload.case_type === 'regulatory_complaint') {
                await insforge.database
                    .from('service_cases')
                    .update({ is_regulatory: true })
                    .eq('case_id', id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
