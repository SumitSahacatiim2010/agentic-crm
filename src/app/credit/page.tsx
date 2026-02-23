// /credit — Phase 5 SSR page
export const dynamic = 'force-dynamic';

import { insforge } from '@/lib/insforge-client';
import { CreditWorkbenchClient } from '@/components/credit/CreditWorkbenchClient';

async function getCreditApplications() {
    const { data } = await insforge.database
        .from('credit_applications')
        .select('application_id, applicant_name, business_name, loan_amount, product_type, purpose, status, routing_path, risk_rating, credit_score, fraud_flag, created_at')
        .order('created_at', { ascending: false });
    return (data || []) as any[];
}

async function getSpreads() {
    const { data } = await insforge.database.from('credit_financial_spreads').select('*');
    const map: Record<string, any> = {};
    ((data || []) as any[]).forEach(s => { map[s.application_id] = s; });
    return map;
}

async function getBureaus() {
    const { data } = await insforge.database.from('credit_bureau_reports').select('*').order('pulled_at', { ascending: false });
    const map: Record<string, any> = {};
    ((data || []) as any[]).forEach(b => { if (!map[b.application_id]) map[b.application_id] = b; });
    return map;
}

export default async function CreditPage() {
    const [apps, spreads, bureaus] = await Promise.all([getCreditApplications(), getSpreads(), getBureaus()]);
    return <CreditWorkbenchClient applications={apps} spreads={spreads} bureaus={bureaus} />;
}
