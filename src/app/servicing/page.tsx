// src/app/servicing/page.tsx — SSR Case Inbox
export const dynamic = 'force-dynamic';

import { insforge } from '@/lib/insforge-client';
import { CaseInboxClient, ServiceCase } from '@/components/servicing/CaseInboxClient';
import { Headphones } from 'lucide-react';

async function getServiceCaseInbox() {
    const { data, error } = await insforge.database
        .from('service_cases')
        .select('case_id, subject, status, priority, priority_band, channel, is_regulatory, customer_id, sla_deadline, created_at')
        .order('priority_band', { ascending: true })
        .order('sla_deadline', { ascending: true })
        .limit(100);
    if (error) { console.error('[servicing]', error); return []; }
    return (data || []) as ServiceCase[];
}

async function getSLAEventsForCases(caseIds: string[]) {
    if (!caseIds.length) return {};
    const { data } = await insforge.database
        .from('case_sla_events')
        .select('event_id, case_id, event_type, sla_band, sla_due_at, actual_at, status, notes')
        .in('case_id', caseIds);
    const map: Record<string, any[]> = {};
    for (const e of (data || [])) {
        const ev = e as any;
        if (!map[ev.case_id]) map[ev.case_id] = [];
        map[ev.case_id].push(ev);
    }
    return map;
}

export default async function ServicingPage() {
    const cases = await getServiceCaseInbox();
    const caseIds = cases.map(c => c.case_id);
    const slaEvents = await getSLAEventsForCases(caseIds);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Inbox */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <CaseInboxClient initialCases={cases} slaEvents={slaEvents} />
            </div>
        </div>
    );
}
