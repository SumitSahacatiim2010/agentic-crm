// /compliance — Phase 6 SSR page
export const dynamic = 'force-dynamic';

import { insforge } from '@/lib/insforge-client';
import { ComplianceDashboardClient } from '@/components/compliance/ComplianceDashboardClient';

async function getMetrics() {
    const { data } = await insforge.database.from('compliance_dashboard_metrics').select('*').limit(1);
    return (data as any)?.[0] ?? {};
}

async function getQueues() {
    const [amlApps, amlCases, kycItems, suitItems] = await Promise.all([
        insforge.database.from('onboarding_applications')
            .select('application_id, full_name, sanctions_outcome, sanctions_score, sanctions_screened_at, compliance_case_id, preventive_control_log, status')
            .in('sanctions_outcome', ['HIT', 'INCONCLUSIVE'])
            .order('sanctions_screened_at', { ascending: false }),
        insforge.database.from('service_cases')
            .select('case_id, subject, status, priority_band, created_at, customer_id')
            .eq('is_regulatory', true).neq('status', 'Closed')
            .order('created_at', { ascending: false }).limit(20),
        insforge.database.from('compliance_profiles')
            .select('compliance_id, party_id, kyc_status, kyc_last_review, kyc_next_review, aml_risk_rating, pep_status, fatca_crs_status')
            .lt('kyc_next_review', new Date(Date.now() + 30 * 24 * 3600_000).toISOString())
            .order('kyc_next_review', { ascending: true }).limit(30),
        insforge.database.from('credit_policy_results')
            .select('result_id, application_id, rule_id, rule_type, triggered, required_action, evaluated_at')
            .eq('rule_type', 'soft_exception').eq('triggered', true)
            .order('evaluated_at', { ascending: false }).limit(20),
    ]);
    return {
        amlHits: (amlApps.data ?? []) as any[],
        amlCases: (amlCases.data ?? []) as any[],
        kycItems: (kycItems.data ?? []) as any[],
        suitabilityItems: (suitItems.data ?? []) as any[],
    };
}

async function getAuditRows() {
    const { data } = await insforge.database.from('audit_logs')
        .select('event_id, entity_name, entity_id, action, changes, actor_persona, event_time, regulatory_domain, action_class, reason')
        .order('event_time', { ascending: false }).limit(25);
    return (data ?? []) as any[];
}

export default async function CompliancePage() {
    const [metrics, queues, auditRows] = await Promise.all([getMetrics(), getQueues(), getAuditRows()]);
    return <ComplianceDashboardClient metrics={metrics} queues={queues} auditRows={auditRows} />;
}
