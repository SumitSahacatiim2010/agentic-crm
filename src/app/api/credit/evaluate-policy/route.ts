import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { evaluatePolicy, generateAdverseActionText, PolicyContext } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const { application_id } = await req.json();
        if (!application_id) return NextResponse.json({ error: 'application_id required' }, { status: 400 });

        // Fetch app + spread + bureau
        const [appRes, spreadRes, bureauRes] = await Promise.all([
            insforge.database.from('credit_applications').select('*').eq('application_id', application_id).limit(1),
            insforge.database.from('credit_financial_spreads').select('*').eq('application_id', application_id).limit(1),
            insforge.database.from('credit_bureau_reports').select('*').eq('application_id', application_id).order('pulled_at', { ascending: false }).limit(1),
        ]);
        const app = (appRes.data as any)?.[0];
        const spread = (spreadRes.data as any)?.[0];
        const bureau = (bureauRes.data as any)?.[0];
        if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

        const ctx: PolicyContext = {
            ltv_pct: spread?.ltv_pct ?? 0, dscr: spread?.dscr ?? 999,
            dti_pct: spread?.dti_pct ?? 0, credit_score: app.credit_score ?? 999,
            risk_rating: app.risk_rating ?? 1, fraud_flag: app.fraud_flag ?? false,
            bankruptcies: bureau?.bankruptcies ?? 0, collateral_type: app.collateral_type || 'unsecured',
            loan_amount: Number(app.loan_amount) || 0,
        };

        const result = evaluatePolicy(ctx);

        // Clear previous results
        await insforge.database.from('credit_policy_results').delete().eq('application_id', application_id);

        // Insert triggered rules
        const rows = [
            ...result.hardStops.map(h => ({ application_id, rule_id: h.id, rule_type: 'hard_stop' as const, triggered: true, decline_code: h.declineCode })),
            ...result.softExceptions.map(s => ({ application_id, rule_id: s.id, rule_type: 'soft_exception' as const, triggered: true, required_action: s.requiredAction })),
        ];
        if (rows.length > 0) await insforge.database.from('credit_policy_results').insert(rows);

        // Update decision on app
        await insforge.database.from('credit_applications').update({
            decision: result.decision,
            status: result.decision === 'decline' ? 'declined' : result.decision === 'refer' ? 'conditionally_approved' : 'approved',
            decision_at: new Date().toISOString(),
        }).eq('application_id', application_id);

        // Auto-generate adverse action on decline
        if (result.decision === 'decline') {
            const codes = result.hardStops.map(h => h.declineCode);
            const text = generateAdverseActionText(codes);
            await insforge.database.from('credit_adverse_actions').insert([{
                application_id, decline_codes: codes, reason_text: text.reason,
                bureau_disclosure: text.bureau, ecoa_notice: text.ecoa,
            }]);
        }

        return NextResponse.json(result);
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
