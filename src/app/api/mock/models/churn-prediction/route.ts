import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || 'unknown';

    // Simulate network latency for realism
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Deterministic mock generation based on ID length
    const idLen = customerId.length;

    let prob = 0.15;
    let riskLevel = 'Low';

    if (idLen % 7 === 0) { prob = 0.85; riskLevel = 'High'; } // High risk rule
    else if (idLen % 3 === 0) { prob = 0.45; riskLevel = 'Medium'; } // Medium risk rule

    const topFactors = [];
    const actions = [];

    if (riskLevel === 'High') {
        topFactors.push({ factor: 'Declining direct deposits (-45% YoY)', impact: +35 });
        topFactors.push({ factor: 'Zero engagement over last 90 days', impact: +25 });
        topFactors.push({ factor: 'Large outbound wire transfers detected', impact: +20 });
        actions.push('Trigger proactive relationship manager outreach');
        actions.push('Waive next monthly account fee automatically');
    } else if (riskLevel === 'Medium') {
        topFactors.push({ factor: 'Decreased card utilization', impact: +15 });
        actions.push('Enroll in cashback retention campaign');
    } else {
        topFactors.push({ factor: 'Primary salary account', impact: -40 });
        topFactors.push({ factor: 'Multiple product holding (Stickiness)', impact: -20 });
        actions.push('N/A - Continue standard engagement');
    }

    return NextResponse.json({
        churn_probability: prob,
        risk_level: riskLevel,
        top_factors: topFactors,
        recommended_actions: actions,
        model: 'random-forest-mock-v1',
        evaluated_at: new Date().toISOString()
    });
}
