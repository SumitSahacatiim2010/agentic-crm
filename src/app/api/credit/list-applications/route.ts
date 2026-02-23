import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET() {
    const { data } = await insforge.database
        .from('credit_applications')
        .select('application_id, applicant_name, business_name, loan_amount, product_type, purpose, status, routing_path, risk_rating, credit_score, fraud_flag, created_at')
        .order('created_at', { ascending: false });
    return NextResponse.json(data || []);
}
