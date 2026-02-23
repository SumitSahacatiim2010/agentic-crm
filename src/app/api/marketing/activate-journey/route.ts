import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { writeAuditEntry } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const { journey_id } = await req.json();
        if (!journey_id) return NextResponse.json({ error: 'journey_id required' }, { status: 400 });

        // Load journey + nodes
        const [jRes, nRes] = await Promise.all([
            insforge.database.from('marketing_journeys').select('*').eq('journey_id', journey_id).limit(1),
            insforge.database.from('journey_nodes').select('*').eq('journey_id', journey_id).order('position_x', { ascending: true }),
        ]);
        const journey = (jRes.data as any)?.[0];
        const nodes = (nRes.data as any[]) ?? [];
        if (!journey) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });

        // T4.2.1 Validation: ≥1 trigger + ≥1 action
        const hasTrigger = nodes.some(n => n.node_type === 'trigger');
        const hasAction = nodes.some(n => n.node_type === 'action');
        if (!hasTrigger || !hasAction) {
            return NextResponse.json({ error: 'Journey must contain at least one TRIGGER and one ACTION' }, { status: 400 });
        }

        // Consent scrub
        const consentRes = await insforge.database.from('marketing_consent').select('consent_id, do_not_contact, gdpr_opted_out, email_marketing, sms_marketing, push_notifications, tcpa_restricted');
        const allConsent = (consentRes.data as any[]) ?? [];
        const totalAudience = allConsent.length;

        let suppressed_consent = 0;
        let suppressed_fatigue = 0;
        const eligiblePool: string[] = [];

        // Consent filtering
        for (const c of allConsent) {
            if (c.do_not_contact || c.gdpr_opted_out) { suppressed_consent++; continue; }
            eligiblePool.push(c.consent_id);
        }

        // Fatigue filtering — count 7-day sends per party
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
        const fatigueRes = await insforge.database.from('marketing_fatigue_log')
            .select('party_id')
            .gte('sent_at', sevenDaysAgo)
            .eq('suppressed', false);
        const fatigueCounts: Record<string, number> = {};
        for (const f of ((fatigueRes.data as any[]) ?? [])) {
            if (f.party_id) fatigueCounts[f.party_id] = (fatigueCounts[f.party_id] ?? 0) + 1;
        }
        // Check frequency cap check nodes
        const hasFreqCheck = nodes.some((n: any) => n.node_action === 'check_fatigue');
        if (hasFreqCheck) {
            const overCap = Object.values(fatigueCounts).filter(c => c >= 7).length; // 7/week total cap
            suppressed_fatigue = Math.min(overCap, eligiblePool.length);
        }

        const reachable = Math.max(0, eligiblePool.length - suppressed_fatigue);

        // Process action nodes — spawn CRM artifacts
        let leads_created = 0, tasks_created = 0, emails_queued = 0, sms_queued = 0, push_queued = 0;

        for (const node of nodes) {
            if (node.node_type !== 'action') continue;

            switch (node.node_action) {
                case 'spawn_lead': {
                    // 1 lead per ~36 audience members, min 1 max 10
                    const count = Math.max(1, Math.min(10, Math.floor(reachable / 36)));
                    const leadRows = Array.from({ length: count }, (_, i) => ({
                        full_name: `Campaign Lead ${i + 1}`,
                        source_channel: 'campaign',
                        lead_status: 'new',
                        rating: 'warm',
                        product_interest: journey.campaign_type || 'general',
                    }));
                    await insforge.database.from('leads').insert(leadRows);
                    leads_created += count;
                    break;
                }
                case 'assign_task': {
                    const count = Math.max(1, Math.min(10, Math.floor(reachable / 36)));
                    const alertRows = Array.from({ length: count }, (_, i) => ({
                        title: `Campaign RM Task: ${journey.name} — Lead ${i + 1}`,
                        severity: 'medium',
                        is_read: false,
                    }));
                    await insforge.database.from('rm_alerts').insert(alertRows);
                    tasks_created += count;
                    break;
                }
                case 'send_email': {
                    emails_queued = reachable;
                    // Record fatigue entries
                    const fatRows = Array.from({ length: Math.min(reachable, 50) }, () => ({
                        campaign_id: journey_id, channel: 'email', suppressed: false,
                    }));
                    if (fatRows.length > 0) await insforge.database.from('marketing_fatigue_log').insert(fatRows);
                    break;
                }
                case 'send_sms': {
                    sms_queued = reachable;
                    const fatRows = Array.from({ length: Math.min(reachable, 50) }, () => ({
                        campaign_id: journey_id, channel: 'sms', suppressed: false,
                    }));
                    if (fatRows.length > 0) await insforge.database.from('marketing_fatigue_log').insert(fatRows);
                    break;
                }
                case 'send_push': {
                    push_queued = reachable;
                    const fatRows = Array.from({ length: Math.min(reachable, 50) }, () => ({
                        campaign_id: journey_id, channel: 'push', suppressed: false,
                    }));
                    if (fatRows.length > 0) await insforge.database.from('marketing_fatigue_log').insert(fatRows);
                    break;
                }
            }
        }

        // Write execution record
        const { data: execData } = await insforge.database.from('journey_executions').insert([{
            journey_id, leads_created, tasks_created, emails_queued, sms_queued, push_queued,
            suppressed_fatigue, suppressed_consent,
        }]).select('execution_id').limit(1);

        // Update journey status
        await insforge.database.from('marketing_journeys').update({ status: 'active' }).eq('journey_id', journey_id);

        // Audit log
        await writeAuditEntry({
            entity_name: 'marketing_journeys', entity_id: journey_id,
            action: 'journey_activated',
            changes: { leads_created, tasks_created, emails_queued, suppressed_consent, suppressed_fatigue },
            actor_persona: 'MARKETING_MANAGER',
            regulatory_domain: 'GENERAL', action_class: 'CREATE',
            reason: `Journey activated: ${journey.name}`,
        });

        return NextResponse.json({
            execution_id: (execData as any)?.[0]?.execution_id,
            total_audience: totalAudience, reachable,
            leads_created, tasks_created, emails_queued, sms_queued, push_queued,
            suppressed_consent, suppressed_fatigue,
        });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
