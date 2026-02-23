import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { computePricing, computeDOALevel } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const { application_id, product_type, term_months, approved_amount, discount_requested, conditions } = await req.json();
        if (!application_id || !product_type || !term_months || !approved_amount) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        // Fetch app for risk_rating + check soft exceptions
        const { data: appData } = await insforge.database.from('credit_applications').select('risk_rating, decision').eq('application_id', application_id).limit(1);
        const app = (appData as any)?.[0];
        if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

        const hasSoft = app.decision === 'refer';
        const pricing = computePricing(product_type, app.risk_rating, hasSoft);
        const doa = computeDOALevel(approved_amount);
        const autoApproved = doa === 'analyst';
        const finalRate = +(pricing.finalRate - (discount_requested || 0)).toFixed(3);

        const { data, error } = await insforge.database.from('credit_offers').insert([{
            application_id, product_type,
            base_rate: pricing.baseRate, risk_spread: pricing.riskSpread,
            exception_premium: pricing.exceptionPremium, final_rate: finalRate,
            term_months, approved_amount, conditions: conditions || [],
            doa_level_required: doa, doa_approved: autoApproved,
            discount_requested: discount_requested || 0,
            status: autoApproved ? 'approved' : 'pending_approval',
            expires_at: new Date(Date.now() + 30 * 24 * 3600_000).toISOString(),
        }]).select('offer_id, final_rate, doa_level_required, doa_approved, status').limit(1);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data as any)?.[0], { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
