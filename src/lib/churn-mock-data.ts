
export const CHURN_RISK_METRICS = {
    riskLevel: 'Critical',
    probability: 88,
    projectedLoss: 520000, // Annual Revenue
    primaryDrivers: [
        'Transaction Volume Drop (-40%)',
        'Large Outbound Transfer ($2.1M)',
        'Competitor Inquiry Detected'
    ]
};

export const RETENTION_OFFER = {
    id: 'RET-FX-001',
    title: 'Precision FX Tier 1',
    description: 'Waive spread on next $5M FX volume + Dedicated Trader access.',
    value: 'Est. savings $12,500',
    validUntil: '2026-03-31'
};

export const PRE_DRAFTED_EMAIL = {
    subject: 'Strategic Review: Optimizing your FX capabilities',
    body: `Dear Alexander,\n\nI've been reviewing your recent transaction patterns and noticed some opportunities to optimize your international settlements.\n\nGiven your volume, I've secured approval to move your account to our "Precision FX Tier 1" pricing, effective immediately. This will eliminate spreads on your next $5M in volume.\n\nCan we schedule a 10-minute briefing tomorrow to discuss how this impacts your Q2 liquidity planning?\n\nBest,\nSarah`
};
