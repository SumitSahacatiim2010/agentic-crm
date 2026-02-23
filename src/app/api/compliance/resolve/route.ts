import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { writeAuditEntry } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { entity_type, entity_id, resolution_type, notes, evidence_ref, sar_reference, resolved_by } = body;

        if (!entity_type || !entity_id || !resolution_type) {
            return NextResponse.json({ error: 'entity_type, entity_id, resolution_type required' }, { status: 400 });
        }
        if (!notes?.trim()) {
            return NextResponse.json({ error: 'notes are required for all resolutions' }, { status: 400 });
        }

        let previous_status = '';
        let new_status = '';
        let unblocked = false;

        // ── Path 1: false_positive ──────────────────────────────────────────
        if (resolution_type === 'false_positive' && entity_type === 'onboarding_application') {
            const { data: appData } = await insforge.database
                .from('onboarding_applications')
                .select('status, sanctions_outcome, compliance_case_id')
                .eq('application_id', entity_id)
                .limit(1);
            const app = (appData as any)?.[0];
            previous_status = app?.sanctions_outcome ?? '';

            // Unblock onboarding
            await insforge.database.from('onboarding_applications').update({
                sanctions_outcome: 'CLEARED',
                status: 'in_progress',
            }).eq('application_id', entity_id);
            new_status = 'CLEARED';
            unblocked = true;

            // Close related service case if linked
            if (app?.compliance_case_id) {
                await insforge.database.from('service_cases').update({
                    status: 'Closed', resolved_at: new Date().toISOString(),
                }).eq('case_id', app.compliance_case_id);
            }
        }

        // ── Path 2: true_match ──────────────────────────────────────────────
        if (resolution_type === 'true_match') {
            previous_status = 'HIT';
            new_status = 'HIT_CONFIRMED';
            // Block maintained — no status change on the application
        }

        // ── Path 3: escalate_sar ────────────────────────────────────────────
        if (resolution_type === 'escalate_sar') {
            previous_status = 'INCONCLUSIVE';
            new_status = 'SAR_FILED';
            // Create regulatory service case
            await insforge.database.from('service_cases').insert([{
                subject: `SAR Filing — ${entity_type} ${entity_id.slice(0, 8)}`,
                description: `Suspicious Activity Report escalation. Ref: ${sar_reference || 'PENDING'}. Notes: ${notes}`,
                status: 'Open', priority: 'P1', priority_band: 'P1',
                is_regulatory: true,
                channel: 'compliance',
                sla_deadline: new Date(Date.now() + 3 * 24 * 3600_000).toISOString(),
            }]);
        }

        // ── KYC refresh ─────────────────────────────────────────────────────
        if (resolution_type === 'kyc_refreshed' && entity_type === 'compliance_profile') {
            await insforge.database.from('compliance_profiles').update({
                kyc_status: 'verified',
                kyc_last_review: new Date().toISOString(),
                kyc_next_review: new Date(Date.now() + 365 * 24 * 3600_000).toISOString(),
            }).eq('compliance_id', entity_id);
            new_status = 'verified';
        }

        // ── Suitability override ─────────────────────────────────────────────
        if (['override_approved', 'override_denied'].includes(resolution_type) && entity_type === 'credit_application') {
            new_status = resolution_type === 'override_approved' ? 'conditionally_approved' : 'declined';
            await insforge.database.from('credit_applications').update({ decision: resolution_type === 'override_approved' ? 'refer' : 'decline' }).eq('application_id', entity_id);
        }

        // ── Create resolution record ─────────────────────────────────────────
        const { data: resData } = await insforge.database.from('compliance_resolutions').insert([{
            entity_type, entity_id, resolution_type, notes, evidence_ref: evidence_ref ?? null,
            sar_reference: sar_reference ?? null, resolved_by: resolved_by ?? 'compliance_officer',
            previous_status, new_status, unblocked,
        }]).select('resolution_id').limit(1);

        // ── Immutable audit entry ─────────────────────────────────────────────
        await writeAuditEntry({
            entity_name: entity_type, entity_id,
            action: resolution_type,
            changes: { previous_status, new_status, unblocked, sar_reference: sar_reference ?? null },
            actor_persona: resolved_by ?? 'COMPLIANCE_OFFICER',
            regulatory_domain: 'AML_CTF',
            action_class: resolution_type === 'escalate_sar' ? 'ESCALATE' : 'RESOLVE',
            reason: notes,
        });

        return NextResponse.json({ success: true, resolution_id: (resData as any)?.[0]?.resolution_id }, { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
