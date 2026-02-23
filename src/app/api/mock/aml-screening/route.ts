import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || 'unknown';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple deterministic mock logic based on ID length
    let risk = 'Low';

    if (customerId.length > 20) {
        risk = 'High';
    } else if (customerId.length % 5 === 0) {
        risk = 'Medium';
    }

    return NextResponse.json({
        customer_id: customerId,
        aml_risk_rating: risk,
        screened_at: new Date().toISOString()
    });
}
