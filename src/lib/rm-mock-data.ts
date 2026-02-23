
export type PerformanceMetric = {
    label: string;
    value: string | number;
    subValue?: string;
    status: 'Critical' | 'Warning' | 'Good' | 'Neutral';
    trend?: 'Up' | 'Down' | 'Flat';
};

export type PipelineStage = {
    stage: string;
    count: number;
    value: number; // Raw value
    weightedValue: number; // Probability weighted
    fill: string;
};

export type AlertItem = {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    due: string;
    type: 'Risk' | 'Opportunity' | 'Compliance' | 'Rate';
};

export type TerritorySegment = {
    segment: string;
    penetration: number; // 0-100 percentage
    whitespace: number; // Potential remaining
    customers: number;
    revenue: number;
};

// MOCK DATA
export const MOCK_RM_METRICS: PerformanceMetric[] = [
    {
        label: "YTD Sales Attainment",
        value: "112%",
        subValue: "$4.2M / $3.75M Quota",
        status: "Good",
        trend: "Up"
    },
    {
        label: "Cross-Sell Ratio",
        value: "2.8",
        subValue: "Products per Customer",
        status: "Warning", // Target might be 3.0
        trend: "Flat"
    },
    {
        label: "Revenue per Customer",
        value: "$12.4k",
        subValue: "+8% vs Last Year",
        status: "Good",
        trend: "Up"
    },
    {
        label: "Net Promoter Score",
        value: "72",
        subValue: "Top Tier: Excellent",
        status: "Good",
        trend: "Up"
    }
];

export const MOCK_PIPELINE: PipelineStage[] = [
    { stage: "Prospecting", count: 45, value: 12500000, weightedValue: 1250000, fill: "#94a3b8" }, // 10%
    { stage: "Qualification", count: 28, value: 8400000, weightedValue: 2520000, fill: "#64748b" }, // 30%
    { stage: "Needs Analysis", count: 18, value: 6200000, weightedValue: 3100000, fill: "#475569" }, // 50%
    { stage: "Proposal", count: 12, value: 4500000, weightedValue: 3375000, fill: "#3b82f6" }, // 75%
    { stage: "Negotiation", count: 6, value: 2100000, weightedValue: 1890000, fill: "#6366f1" }, // 90%
    { stage: "Closed-Won", count: 14, value: 3800000, weightedValue: 3800000, fill: "#10b981" }, // 100%
];

export const MOCK_ALERTS: AlertItem[] = [
    {
        id: '1',
        title: "Large Deposit Detected",
        description: "Client 'TechFlow Systems' received $2.5M wire. Engage for treasury products.",
        priority: "High",
        due: "Today",
        type: "Opportunity"
    },
    {
        id: '2',
        title: "KYC Refresh Overdue",
        description: "Elena V. Rossi's documentation expired 3 days ago. Account restrictions pending.",
        priority: "High",
        due: "Immediate",
        type: "Compliance"
    },
    {
        id: '3',
        title: "Rate Lock Expiration",
        description: "Mortgage application for 'The Henderson Trust' rate lock expires in 48 hours.",
        priority: "Medium",
        due: "Tomorrow",
        type: "Rate"
    },
    {
        id: '4',
        title: "At-Risk Opportunity",
        description: "Probability dropped for 'Omega Corp Expansion' loan (from 60% to 30%).",
        priority: "Medium",
        due: "This Week",
        type: "Risk"
    }
];

export const MOCK_TERRITORY: TerritorySegment[] = [
    { segment: "Technology", penetration: 65, whitespace: 35, customers: 142, revenue: 12000000 },
    { segment: "Healthcare", penetration: 42, whitespace: 58, customers: 85, revenue: 8400000 },
    { segment: "Real Estate", penetration: 78, whitespace: 22, customers: 210, revenue: 18500000 },
    { segment: "Manufacturing", penetration: 28, whitespace: 72, customers: 45, revenue: 3200000 },
    { segment: "Retail / SME", penetration: 55, whitespace: 45, customers: 320, revenue: 6800000 },
];

export async function getRMDashboardData() {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        metrics: MOCK_RM_METRICS,
        pipeline: MOCK_PIPELINE,
        alerts: MOCK_ALERTS,
        territory: MOCK_TERRITORY
    };
}
