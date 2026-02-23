
export interface NBAModelOffer {
    id: string;
    productId: string;
    productName: string;
    category: 'Credit' | 'Investment' | 'Insurance' | 'Banking';
    baseScore: number; // 0-100 Propensity Model
    margin: number; // Estimated Life-Time Value
    reason: string;
    regulatoryCheck: boolean; // Suitability
    tags: string[];
}

export const NBA_OFFER_CATALOG: NBAModelOffer[] = [
    {
        id: 'OFF-001',
        productId: 'MORT-OFFSET',
        productName: 'Offset Mortgage',
        category: 'Credit',
        baseScore: 88,
        margin: 4500,
        reason: 'Customer holds >$100k in low-yield deposits which could offset loan interest.',
        regulatoryCheck: true,
        tags: ['Retention', 'High Value']
    },
    {
        id: 'OFF-002',
        productId: 'CC-BLACK',
        productName: 'Infinite Black Card',
        category: 'Credit',
        baseScore: 92,
        margin: 1200,
        reason: 'High travel spend detected ($15k/mo) on non-points debit cards.',
        regulatoryCheck: true,
        tags: ['Cross-Sell', 'Lifestyle']
    },
    {
        id: 'OFF-003',
        productId: 'INV-ESG',
        productName: 'ESG Impact Fund',
        category: 'Investment',
        baseScore: 75,
        margin: 2000,
        reason: 'Portfolio drift analysis indicates underweight in Sustainable Assets.',
        regulatoryCheck: true,
        tags: ['Cross-Sell', 'Thematic']
    },
    {
        id: 'OFF-004',
        productId: 'INS-TERM',
        productName: 'Term Life Insurance',
        category: 'Insurance',
        baseScore: 60,
        margin: 800,
        reason: 'Protection Gap Calculator suggests underinsured status.',
        regulatoryCheck: false, // Requires Suitability Assessment
        tags: ['Protection']
    }
];
