import { getInsforgeServer } from "@/lib/insforge";

export interface CLVProjection {
    clv_5yr: number;
    clv_breakdown: Record<string, number>;
    inputs: {
        revenue_yr: number;
        cost_to_serve_yr: number;
        credit_losses_yr: number;
        discount_rate: number;
    };
    confidence: 'High' | 'Medium' | 'Low';
}

const COST_TO_SERVE_TIERS: Record<string, number> = {
    'Standard': 50 * 12, // Annualized
    'Premium': 100 * 12,
    'HNW': 300 * 12,
    'UHNW': 800 * 12,
    'Default': 50 * 12
};

export async function calculateCLV(customerId: string): Promise<CLVProjection> {
    const db = (await getInsforgeServer()).database;

    const [custData, productsData] = await Promise.all([
        db.from('individual_parties').select('segment_tier, total_balance').eq('party_id', customerId).single(),
        db.from('customer_products').select('product_id, current_balance, opened_at')
            .eq('customer_id', customerId)
            .eq('status', 'Active')
    ]);

    const customer = (custData.data || {}) as any;
    const tier = customer.segment_tier || 'Standard';
    const totalBalance = Number(customer.total_balance || 0);
    const products = productsData.data || [];

    // 1. Revenue Estimation
    // For V1, we estimate revenue based on a fixed margin % of total balances held.
    // Example: 2.5% Net Interest Margin + Fee Income Proxy
    const NIM_PROXY = 0.025;
    let baseRevenueYr = totalBalance * NIM_PROXY;

    // Add flat activity value per product
    baseRevenueYr += products.length * 150;

    // Minimum revenue floor per tier so CLV never shows $0 for demo data
    const MIN_REVENUE: Record<string, number> = { 'Standard': 1200, 'Premium': 4800, 'HNW': 18000, 'UHNW': 48000, 'Default': 1200 };
    baseRevenueYr = Math.max(baseRevenueYr, MIN_REVENUE[tier] || MIN_REVENUE['Default']);

    // 2. Cost to Serve
    const costToServeYr = COST_TO_SERVE_TIERS[tier] || COST_TO_SERVE_TIERS['Default'];

    // 3. Credit Losses Estimate (Mocked via length of ID for determinism)
    // 0.5% default probability on loan balances proxy
    const churnProxyScore = (customerId.length % 5) / 10; // 0.0 to 0.4
    const creditLossesYr = totalBalance * 0.05 * churnProxyScore;

    // 4. Discounted Cash Flow Formula
    const DISCOUNT_RATE = 0.10; // 5% risk free + 5% risk premium
    let cumulativeCLV = 0;
    const breakdown: Record<string, number> = {};

    for (let t = 1; t <= 5; t++) {
        const netCashFlow = baseRevenueYr - costToServeYr - creditLossesYr;

        // Assume slight 3% growth in cashflow per year
        const adjustedCashFlow = netCashFlow * Math.pow(1.03, t - 1);

        const discountedValue = adjustedCashFlow / Math.pow((1 + DISCOUNT_RATE), t);

        cumulativeCLV += discountedValue;
        breakdown[`Year ${t}`] = Math.round(discountedValue);
    }

    return {
        clv_5yr: Math.max(0, Math.round(cumulativeCLV)),
        clv_breakdown: breakdown,
        inputs: {
            revenue_yr: Math.round(baseRevenueYr),
            cost_to_serve_yr: costToServeYr,
            credit_losses_yr: Math.round(creditLossesYr),
            discount_rate: DISCOUNT_RATE
        },
        confidence: products.length > 2 ? 'High' : 'Medium'
    };
}
