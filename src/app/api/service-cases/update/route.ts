// src/app/api/service-cases/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { case_id, status, assignee_id, priority_band } = await req.json();
        if (!case_id) return NextResponse.json({ error: 'case_id required' }, { status: 400 });

        const updates: Record<string, unknown> = {};
        if (status) updates.status = status;
        if (assignee_id !== undefined) updates.assignee_id = assignee_id;
        if (priority_band) updates.priority_band = priority_band;

        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString();
            // Mark resolution SLA event
            const { data: events } = await insforge.database
                .from('case_sla_events')
                .select('event_id, sla_due_at')
                .eq('case_id', case_id)
                .eq('event_type', 'resolution')
                .limit(1);
            const resEvent = events?.[0] as any;
            if (resEvent) {
                const now = new Date();
                const slaDue = new Date(resEvent.sla_due_at);
                await insforge.database.from('case_sla_events').update({
                    actual_at: now.toISOString(),
                    status: now <= slaDue ? 'met' : 'breached'
                }).eq('event_id', resEvent.event_id);
            }
        }

        if (status === 'closed') {
            updates.closed_at_case = new Date().toISOString();
            await insforge.database.from('case_sla_events').insert([{
                case_id, event_type: 'closed', actual_at: new Date().toISOString(), status: 'met'
            }]);
        }

        const { error } = await insforge.database.from('service_cases').update(updates).eq('case_id', case_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
