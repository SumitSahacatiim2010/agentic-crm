import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';
import { computeCreditScore, computeRiskRating, computeFraudFlag, computeTriageRouting } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { applicant_name, business_name, loan_amount, product_type, purpose, collateral_type, collateral_value, customer_id, opportunity_id } = body;
        if (!applicant_name || !loan_amount || !product_type) return NextResponse.json({ error: 'applicant_name, loan_amount, product_type required' }, { status: 400 });

        const credit_score = computeCreditScore(applicant_name);
        const risk_rating = computeRiskRating(applicant_name, loan_amount);
        const fraud_flag = computeFraudFlag(applicant_name);
        const routing_path = computeTriageRouting(credit_score, loan_amount, risk_rating, fraud_flag, product_type);
        const status = routing_path === 'STP' ? 'underwriting' : 'pending_triage';

        const db = (await getInsforgeServer()).database;
        const { data, error } = await db.from('credit_applications').insert([{
            applicant_name, business_name, loan_amount, product_type, purpose,
            collateral_type: collateral_type || 'unsecured', collateral_value: collateral_value || 0,
            credit_score, risk_rating, fraud_flag, routing_path, status,
            customer_id: customer_id || null, opportunity_id: opportunity_id || null,
        }]).select('application_id, routing_path, credit_score, risk_rating, fraud_flag, status');

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data as any)?.[0], { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
