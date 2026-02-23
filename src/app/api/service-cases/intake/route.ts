// src/app/api/service-cases/intake/route.ts
// Computes SLA due timestamps server-side at intake and persists to case_sla_events.
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

const SLA_MATRIX: Record<string, { ackMinutes: number; resHours: number }> = {
    P1: { ackMinutes: 15, resHours: 4 },
    P2: { ackMinutes: 60, resHours: 24 },
    P3: { ackMinutes: 240, resHours: 72 },
    P4: { ackMinutes: 1440, resHours: 120 },
};

// Regulatory complaints override: ack ≤ 1 business day, res ≤ 8 weeks
const REGULATORY_SLA = { ackMinutes: 480, resHours: 1344 }; // 8h ack, 56d resolution

export async function POST(req: NextRequest) {
    try {
        const { customer_id, subject, description, category, priority_band, channel } = await req.json();
        if (!subject) return NextResponse.json({ error: 'subject required' }, { status: 400 });

        const band = priority_band || 'P3';
        const isRegulatory = category === 'regulatory_complaint';
        const sla = isRegulatory ? REGULATORY_SLA : (SLA_MATRIX[band] || SLA_MATRIX.P3);

        const intakeAt = new Date();
        const ackDueAt = new Date(intakeAt.getTime() + sla.ackMinutes * 60 * 1000);
        const resDueAt = new Date(intakeAt.getTime() + sla.resHours * 60 * 60 * 1000);
        const slaDeadline = ackDueAt; // backward compat with existing sla_deadline col

        // 1. Insert service case
        const { data: caseData, error: caseErr } = await insforge.database
            .from('service_cases')
            .insert([{
                customer_id: customer_id || null,
                subject,
                description: description || null,
                priority: band === 'P1' ? 'critical' : band === 'P2' ? 'high' : band === 'P3' ? 'medium' : 'low',
                priority_band: band,
                channel: channel || 'web',
                is_regulatory: isRegulatory,
                status: 'open',
                sla_deadline: slaDeadline.toISOString(),
            }])
            .select('case_id')
            .limit(1);

        if (caseErr || !caseData?.[0]) {
            return NextResponse.json({ error: caseErr?.message || 'Case insert failed' }, { status: 500 });
        }
        const caseId = caseData[0].case_id as string;

        // 2. Insert SLA events: intake + acknowledgment + resolution
        const slaEvents = [
            {
                case_id: caseId, event_type: 'intake', sla_band: band,
                actual_at: intakeAt.toISOString(), status: 'met', sla_due_at: intakeAt.toISOString(),
            },
            {
                case_id: caseId, event_type: 'acknowledgment', sla_band: band,
                sla_due_at: ackDueAt.toISOString(), status: 'pending',
            },
            {
                case_id: caseId, event_type: 'resolution', sla_band: band,
                sla_due_at: resDueAt.toISOString(), status: 'pending',
            },
        ];

        await insforge.database.from('case_sla_events').insert(slaEvents);

        return NextResponse.json({
            case_id: caseId,
            priority_band: band,
            ack_due_at: ackDueAt.toISOString(),
            resolution_due_at: resDueAt.toISOString(),
            is_regulatory: isRegulatory,
        }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
