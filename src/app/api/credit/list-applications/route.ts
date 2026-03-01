import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET() {
    const { data, error } = await insforge.database
        .from('credit_applications')
        .select('id, applicant_name, company_name, requested_amount, loan_type, status, route_type, orr_rating, fico_score, policy_check_result, created_at')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json([], { status: 200 });

    const mapped = (data || []).map((row: any) => ({
        application_id: row.id,
        applicant_name: row.applicant_name,
        business_name: row.company_name,
        loan_amount: row.requested_amount,
        product_type: row.loan_type,
        purpose: row.policy_check_result?.purpose || '',
        status: row.status,
        routing_path: row.route_type,
        risk_rating: Number(row.orr_rating || 0),
        credit_score: row.fico_score,
        fraud_flag: row.policy_check_result?.fraud_flag || false,
        created_at: row.created_at
    }));
    return NextResponse.json(mapped);
}
