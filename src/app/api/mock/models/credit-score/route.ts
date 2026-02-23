import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || 'unknown';

    // Simulate network latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    // Deterministic mock generation based on ID length & characters
    const idValue = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Base score 300-850
    const baseScore = 300 + (idValue % 550);

    let riskGrade = 'C';
    let defaultProb = 0.05;

    if (baseScore >= 750) { riskGrade = 'A'; defaultProb = 0.01; }
    else if (baseScore >= 680) { riskGrade = 'B'; defaultProb = 0.02; }
    else if (baseScore >= 550) { riskGrade = 'D'; defaultProb = 0.12; }
    else if (baseScore < 550) { riskGrade = 'F'; defaultProb = 0.25; }

    const topFactors = [];
    if (baseScore >= 700) {
        topFactors.push({ factor: 'Length of credit history (>7 yrs)', impact: +45 });
        topFactors.push({ factor: 'Low credit utilization (12%)', impact: +30 });
    } else {
        topFactors.push({ factor: 'Recent missed payment (Auto Loan)', impact: -60 });
        topFactors.push({ factor: 'High revolving credit utilization (88%)', impact: -40 });
    }

    return NextResponse.json({
        score: baseScore,
        risk_grade: riskGrade,
        default_probability: defaultProb,
        top_factors: topFactors,
        model: 'xgboost-mock-v1',
        evaluated_at: new Date().toISOString()
    });
}
