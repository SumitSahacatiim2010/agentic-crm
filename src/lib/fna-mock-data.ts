
export type Goal = {
    id: string;
    name: string;
    amount: number;
    horizon: 'Short' | 'Medium' | 'Long'; // <3, 3-10, >10 years
    priority: 'High' | 'Medium' | 'Low';
};

export type RiskProfile = {
    score: number; // 0-100
    category: 'Conservative' | 'Moderate' | 'Aggressive';
    description: string;
    maxEquityExposure: number; // %
};

export type Product = {
    id: string;
    name: string;
    type: string;
    riskRating: 'Low' | 'Medium' | 'High'; // Maps to 1, 3, 5 internally
    minInvestment: number;
};

export const MOCK_GOALS: Goal[] = [
    { id: 'g1', name: "Emergency Fund", amount: 50000, horizon: 'Short', priority: 'High' },
    { id: 'g2', name: "Home Renovation", amount: 120000, horizon: 'Medium', priority: 'Medium' },
    { id: 'g3', name: "Early Retirement", amount: 2500000, horizon: 'Long', priority: 'High' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: "Global Government Bond Fund", type: "Mutual Fund", riskRating: 'Low', minInvestment: 1000 },
    { id: 'p2', name: "Blue Chip Dividend ETF", type: "ETF", riskRating: 'Medium', minInvestment: 500 },
    { id: 'p3', name: "Emerging Market Growth Fund", type: "Mutual Fund", riskRating: 'High', minInvestment: 5000 },
    { id: 'p4', name: "Crypto Asset Index", type: "Alternative", riskRating: 'High', minInvestment: 10000 },
];

export const calculateRiskScore = (answers: number[]): RiskProfile => {
    const sum = answers.reduce((a, b) => a + b, 0);
    // Simple logic: Max score assumed to be around 50 for demo questions
    // Normalized to 0-100
    const normalized = Math.min(100, Math.round((sum / 25) * 100)); // Assuming 5 questions max 5 points each

    let category: RiskProfile['category'] = 'Moderate';
    if (normalized < 40) category = 'Conservative';
    else if (normalized > 75) category = 'Aggressive';

    const descriptions = {
        Conservative: "Principal protection is priority. Willing to accept lower returns for lower volatility.",
        Moderate: "Balanced approach. Seeks capital appreciation with moderate tolerance for market fluctuations.",
        Aggressive: "Maximize growth. High tolerance for volatility and potential loss of capital."
    };

    const exposures = {
        Conservative: 20,
        Moderate: 60,
        Aggressive: 90
    };

    return {
        score: normalized,
        category,
        description: descriptions[category],
        maxEquityExposure: exposures[category]
    };
};
