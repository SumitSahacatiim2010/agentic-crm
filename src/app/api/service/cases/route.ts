import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const db = (await getInsforgeServer()).database;
        let query = db
            .from('service_cases')
            .select('*', { count: 'exact' });

        const status = searchParams.get('status');
        if (status) query = query.eq('status', status);

        const priority = searchParams.get('priority');
        if (priority) query = query.eq('priority', priority);

        const persona = searchParams.get('persona');
        if (persona === 'SERVICE_AGENT') {
            query = query.eq('assigned_agent', 'Tom Hardy');
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 500 });
        }

        return NextResponse.json({
            data,
            meta: { total: count, limit, page }
        });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}

const SLA_HOURS: Record<string, number> = {
    P1: 4,
    P2: 8,
    P3: 24,
    P4: 48,
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer_id, subject, description, category, priority_band, channel } = body;

        if (!subject) return NextResponse.json({ error: 'subject required' }, { status: 400 });

        const band = priority_band || 'P3';
        const isRegulatory = category === 'regulatory_complaint';
        const slaHours = isRegulatory ? 1344 : (SLA_HOURS[band] || 24);

        const intakeAt = new Date();
        const ackDueAt = new Date(intakeAt.getTime() + (isRegulatory ? 8 : 1) * 60 * 60 * 1000);
        const resDueAt = new Date(intakeAt.getTime() + slaHours * 60 * 60 * 1000);
        const slaDeadline = ackDueAt;

        const db = (await getInsforgeServer()).database;

        // Routing Logic (T5.5)
        let assignedAgent = 'Tom Hardy';
        let routingRule = 'Default Load Balancing';
        let routingReason = 'Assigned to default agent pool due to missing criteria.';

        if (customer_id) {
            const { data: customerData } = await db.from('individual_parties').select('segment_tier, assigned_rm, nationality').eq('party_id', customer_id).single();
            if (customerData) {
                if (['HNW', 'UHNW'].includes(customerData.segment_tier)) {
                    assignedAgent = customerData.assigned_rm || 'Senior Agent Desk';
                    routingRule = 'VIP Routing';
                    routingReason = 'Customer is HNW/UHNW. Routed to designated RM/Senior Agent.';
                } else if (category === 'Technical') {
                    assignedAgent = 'Technical Support Desk';
                    routingRule = 'Skill Routing';
                    routingReason = 'Case type is Technical.';
                } else if (category === 'Complaint' || isRegulatory) {
                    assignedAgent = 'Complaints Specialist';
                    routingRule = 'Skill Routing';
                    routingReason = 'Case type is Complaint/Regulatory.';
                } else if (channel === 'Branch') {
                    assignedAgent = 'Branch Service Officer';
                    routingRule = 'Channel Routing';
                    routingReason = 'Case opened via Branch.';
                }
            }
        }

        const { data: caseData, error: caseErr } = await db
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
                assigned_agent: assignedAgent,
                // store routing reasons directly in description for now if no columns exist
            }])
            .select('case_id')
            .limit(1);

        if (caseErr || !caseData?.[0]) {
            return NextResponse.json({ error: caseErr?.message || 'Case insert failed' }, { status: 500 });
        }

        const caseId = caseData[0].case_id;

        const slaEvents = [
            { case_id: caseId, event_type: 'intake', sla_band: band, actual_at: intakeAt.toISOString(), status: 'met', sla_due_at: intakeAt.toISOString() },
            { case_id: caseId, event_type: 'acknowledgment', sla_band: band, sla_due_at: ackDueAt.toISOString(), status: 'pending' },
            { case_id: caseId, event_type: 'resolution', sla_band: band, sla_due_at: resDueAt.toISOString(), status: 'pending' },
        ];
        await db.from('case_sla_events').insert(slaEvents);

        return NextResponse.json({
            case_id: caseId,
            priority_band: band,
            ack_due_at: ackDueAt.toISOString(),
            resolution_due_at: resDueAt.toISOString(),
            is_regulatory: isRegulatory,
            routing: { rule: routingRule, reason: routingReason, assigned_agent: assignedAgent },
            sla_events: slaEvents
        }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

