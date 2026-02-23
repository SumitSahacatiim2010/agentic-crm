
export type ProductCategory = 'Mortgage' | 'Personal Loan' | 'Auto Loan' | 'Credit Card' | 'Deposit';

export interface ProductOffer {
    id: string;
    name: string;
    category: ProductCategory;
    description: string;
    baseRate: number; // Annual Interest Rate %
    floorRate: number; // Minimum rate allowed without approval
    minAmount: number;
    maxAmount: number;
    termOptions: number[]; // Months (e.g., 12, 36, 60)
    processingFee: number;
}

export const MOCK_OFFERS: ProductOffer[] = [
    {
        id: 'OFF-001',
        name: "Prime Home Mortgage",
        category: "Mortgage",
        description: "Fixed rate mortgage for primary residence. 20% down payment required.",
        baseRate: 6.50,
        floorRate: 5.75,
        minAmount: 100000,
        maxAmount: 2000000,
        termOptions: [180, 360], // 15, 30 years
        processingFee: 1500
    },
    {
        id: 'OFF-002',
        name: "Unsecured Personal Loan",
        category: "Personal Loan",
        description: "Flexible personal loan for debt consolidation or major purchases.",
        baseRate: 9.99,
        floorRate: 8.50,
        minAmount: 5000,
        maxAmount: 50000,
        termOptions: [12, 24, 36, 48, 60],
        processingFee: 250
    },
    {
        id: 'OFF-003',
        name: "Auto Advantage Loan",
        category: "Auto Loan",
        description: "Competitive rates for new and used vehicle financing.",
        baseRate: 5.25,
        floorRate: 4.50,
        minAmount: 10000,
        maxAmount: 100000,
        termOptions: [36, 48, 60, 72],
        processingFee: 0
    },
    {
        id: 'OFF-004',
        name: "Platinum Rewards Card",
        category: "Credit Card",
        description: "Premium travel rewards with no foreign transaction fees.",
        baseRate: 18.24,
        floorRate: 15.99,
        minAmount: 5000, // Credit Limit
        maxAmount: 50000,
        termOptions: [12], // Recurring
        processingFee: 95 // Annual Fee
    }
];

export const PRICING_RULES = {
    creditScoreAdjustment: (score: number) => {
        if (score >= 800) return -0.50;
        if (score >= 750) return -0.25;
        if (score >= 700) return 0.00;
        if (score >= 650) return 1.00;
        return 2.50;
    },
    relationshipAdjustment: (tier: string) => {
        if (tier === 'Diamond') return -0.25;
        if (tier === 'Platinum') return -0.15;
        if (tier === 'Gold') return -0.10;
        return 0.00;
    }
};
