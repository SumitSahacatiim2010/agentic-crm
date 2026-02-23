import { getInsforgeServer } from "@/lib/insforge";

export interface NBARecommendation {
    product: any;
    score: number;
    top_factors: { factor: string; weight: number }[];
    why_now: string;
    confidence: 'High' | 'Medium' | 'Low';
}

const URGENCY_MULTIPLIERS: Record<string, number> = {
    'At-Risk': 1.3,
    'Growth': 1.1,
    'Default': 1.0
};

const MARGIN_WEIGHTS: Record<string, number> = {
    'Investments': 1.5,
    'Lending': 1.3,
    'Cards': 1.2,
    'Insurance': 1.1,
    'Deposits': 1.0,
    'Default': 1.0
};

export async function generateNBARecommendations(customerId: string): Promise<NBARecommendation[]> {
    const db = (await getInsforgeServer()).database;

    // Stage 1: Eligibility Filtering
    const [custData, heldData, catalogData] = await Promise.all([
        db.from('individual_parties').select('*').eq('id', customerId).single(),
        db.from('customer_products').select('product_id').eq('customer_id', customerId),
        db.from('product_catalog').select('*').eq('status', 'Active')
    ]);

    const customer = custData.data || {};
    const heldProductIds = (heldData.data || []).map(p => p.product_id);
    const catalog = catalogData.data || [];

    // Filter out already held products
    const eligibleProducts = catalog.filter(p => !heldProductIds.includes(p.id));

    if (eligibleProducts.length === 0) return [];

    // Derive mock customer signals if not explicitly in DB (for rule-based demo)
    const financialHealth = 85; // Mock
    const npsScore = 60; // Mock
    const churnRiskScore = 0.2; // Mock

    // Sort to find categories with 0 products held
    const heldCategories = catalog.filter(p => heldProductIds.includes(p.id)).map(p => p.product_category);

    // Stage 2 & 3: Propensity Scoring & Prioritization
    const scoredProducts = eligibleProducts.map(product => {
        let score = 0;
        const factors: { factor: string; weight: number }[] = [];

        // Rule 1: Category Fill
        if (!heldCategories.includes(product.product_category)) {
            score += 15;
            factors.push({ factor: `Gap: No existing ${product.product_category?.toLowerCase()} product`, weight: +15 });
        }

        // Rule 2: Tier Targeting
        const tierLevels = { 'Standard': 1, 'Premium': 2, 'HNW': 3, 'UHNW': 4 };
        const custTier = tierLevels[(customer.segment_tier as keyof typeof tierLevels)] || 1;
        const prodTier = tierLevels[(product.target_segment as keyof typeof tierLevels)] || 1;

        if (custTier >= prodTier) {
            score += 20;
            factors.push({ factor: 'Tier eligibility alignment', weight: +20 });
        }

        // Rule 3: Lifecycle
        if (customer.lifecycle_stage === 'Growth') {
            score += 10;
            factors.push({ factor: 'Growth lifecycle stage', weight: +10 });
        }

        // Rule 4: Health & NPS
        if (financialHealth > 70) {
            score += 10;
            factors.push({ factor: `High financial health (${financialHealth}/100)`, weight: +10 });
        }
        if (npsScore > 50) {
            score += 5;
            factors.push({ factor: 'Positive brand sentiment', weight: +5 });
        }

        // Rule 5: Churn penalty
        if (churnRiskScore > 0.7) {
            score -= 20;
            factors.push({ factor: 'High churn risk suppression', weight: -20 });
        }

        // Stage 3 applied
        const urgency = URGENCY_MULTIPLIERS[customer.lifecycle_stage || ''] || URGENCY_MULTIPLIERS['Default'];
        const marginWeight = MARGIN_WEIGHTS[product.product_category || ''] || MARGIN_WEIGHTS['Default'];
        const compositeScore = score * marginWeight * urgency;

        // Sort factors by highest absolute weight
        factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

        return {
            product,
            score: Math.round(compositeScore),
            top_factors: factors.slice(0, 3),
            why_now: generateWhyNow(product.product_category, customer.lifecycle_stage),
            confidence: compositeScore >= 75 ? 'High' : compositeScore >= 50 ? 'Medium' : 'Low' as any
        };
    });

    // Sort by descending score and take top 3
    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts.slice(0, 3);
}

function generateWhyNow(category: string, lifecycle: string): string {
    const defaultReasons = [
        "Customer profile indicates immediate eligibility for this tier upgrade.",
        "Recent activity pattern aligns with optimal product fit.",
        "Identified as a whitespace opportunity to deepen the relationship."
    ];

    if (category === 'Investments' && lifecycle === 'Growth') return "Customer's wealth is expanding; right time to introduce structured investment vehicles.";
    if (category === 'Lending') return "Prevailing rate environment makes this an optimal time for credit deployment.";

    // Deterministic pseudo-random choice
    const idx = (category?.length || 0 + lifecycle?.length || 0) % defaultReasons.length;
    return defaultReasons[idx];
}
