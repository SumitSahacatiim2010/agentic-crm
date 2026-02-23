
export type LeadSource = 'Web Form' | 'Partner API' | 'Branch Walk-in' | 'Referral';

export type ScoreFactor = {
    factor: string;
    points: number;
    type: 'Positive' | 'Negative';
};

export type Lead = {
    id: string;
    name: string;
    company?: string; // For corporate leads
    role?: string;
    source: LeadSource;
    demographicScore: number;
    behavioralScore: number;
    totalScore: number; // 0-100
    probability: number; // 0-100%
    status: 'New' | 'Attempted' | 'Qualified' | 'Converted' | 'Disqualified';
    scoreBreakdown: ScoreFactor[];
    lastActive: string;
    email: string;
    phone: string;
};

export const MOCK_LEADS: Lead[] = [
    {
        id: "L-1024",
        name: "Dr. Emily Chen",
        source: "Web Form",
        demographicScore: 85,
        behavioralScore: 92,
        totalScore: 89,
        probability: 85,
        status: "New",
        lastActive: "2 hours ago",
        email: "emily.chen@example.com",
        phone: "+1 (555) 012-3456",
        scoreBreakdown: [
            { factor: "High Net Worth Zip Code", points: 15, type: "Positive" },
            { factor: "Mortgage Calculator Usage (>3 times)", points: 20, type: "Positive" },
            { factor: "Email Open Rate > 50%", points: 10, type: "Positive" },
            { factor: "No previous banking relationship", points: -5, type: "Negative" }
        ]
    },
    {
        id: "L-1025",
        name: "TechStart Solutions",
        company: "TechStart Solutions LLC",
        role: "CEO (Michael Ross)",
        source: "Partner API",
        demographicScore: 70,
        behavioralScore: 45,
        totalScore: 58,
        probability: 40,
        status: "Attempted",
        lastActive: "1 day ago",
        email: "m.ross@techstart.io",
        phone: "+1 (555) 098-7654",
        scoreBreakdown: [
            { factor: "Registered Business Entity", points: 10, type: "Positive" },
            { factor: "Requested API Documentation", points: 15, type: "Positive" },
            { factor: "High Bounce Rate on Pricing Page", points: -10, type: "Negative" },
            { factor: "Competitor Cookie Detected", points: -10, type: "Negative" }
        ]
    },
    {
        id: "L-1026",
        name: "Sarah Jenkins",
        source: "Branch Walk-in",
        demographicScore: 95,
        behavioralScore: 30,
        totalScore: 62,
        probability: 55,
        status: "New",
        lastActive: "4 hours ago",
        email: "s.jenkins@gmail.com",
        phone: "+1 (555) 111-2222",
        scoreBreakdown: [
            { factor: "Face-to-Face Interaction", points: 25, type: "Positive" },
            { factor: "Verified Income Documents", points: 20, type: "Positive" },
            { factor: "Declined Credit Check", points: -20, type: "Negative" }
        ]
    },
    {
        id: "L-1027",
        name: "David Kim",
        source: "Referral",
        demographicScore: 88,
        behavioralScore: 85,
        totalScore: 87,
        probability: 90,
        status: "New",
        lastActive: "10 mins ago",
        email: "dkim.invest@outlook.com",
        phone: "+1 (555) 333-4444",
        scoreBreakdown: [
            { factor: "Referred by Platinum Client", points: 30, type: "Positive" },
            { factor: "Multiple Investment Page Visits", points: 15, type: "Positive" },
            { factor: "Downloaded Wealth Report", points: 10, type: "Positive" },
            { factor: "Out of Territory", points: -5, type: "Negative" }
        ]
    },
    {
        id: "L-1028",
        name: "GreenLeaf Organics",
        company: "GreenLeaf Organics Inc",
        role: "CFO (Amanda Lee)",
        source: "Web Form",
        demographicScore: 60,
        behavioralScore: 20,
        totalScore: 40,
        probability: 25,
        status: "Disqualified",
        lastActive: "3 days ago",
        email: "contact@greenleaforganics.com",
        phone: "+1 (555) 555-5555",
        scoreBreakdown: [
            { factor: "Incomplete Application", points: -15, type: "Negative" },
            { factor: "Low Annual Turnover", points: -10, type: "Negative" },
            { factor: "Industry Risk (Agriculture)", points: -5, type: "Negative" }
        ]
    }
];

export async function getLeads() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_LEADS;
}

export async function simulateRouting(leadId: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        assignedTo: "Sarah Connor",
        role: "Senior Relationship Manager",
        reason: "Capacity available & Mandarin language match"
    };
}
