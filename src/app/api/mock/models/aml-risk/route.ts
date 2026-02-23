import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || 'unknown';

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 900));

    // Deterministic logic based on ID starting character or length
    const idVal = customerId.charCodeAt(customerId.length - 1) * customerId.length;
    const score = idVal % 100; // 0 to 99

    let rating = 'Low';
    if (score > 80) rating = 'High';
    else if (score > 50) rating = 'Medium';

    const riskFactors = [];
    if (rating === 'High') {
        riskFactors.push({ factor: 'UBO connected to sanctioned entity', weight: 45 });
        riskFactors.push({ factor: 'Unexpected spike in cross-border velocity', weight: 35 });
    } else if (rating === 'Medium') {
        riskFactors.push({ factor: 'Incomplete Source of Wealth justification', weight: 25 });
        riskFactors.push({ factor: 'Address match partially aligns with high-risk jurisdiction', weight: 15 });
    } else {
        riskFactors.push({ factor: 'Domestic transaction pattern', weight: -30 });
        riskFactors.push({ factor: 'Verified long-term employment data', weight: -20 });
    }

    return NextResponse.json({
        risk_rating: rating,
        risk_score: score,
        risk_factors: riskFactors,
        model: 'rule-hybrid-mock-v1',
        screened_at: new Date().toISOString()
    });
}
