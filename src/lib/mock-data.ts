

// Types compliant with our Schema
export type CustomerProfileType = {
    customer_id: string;
    full_legal_name: string;
    entity_type: 'Individual' | 'Corporate';
    tier: 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'UHNW';
    financial_health_score: number; // 0-100
    global_id: string; // Formatting like "CUST-US-..."
    email: string;
    phone: string;
    avatar_url?: string;
    joined_date: string;
    rm_name: string;
};

export type FinancialHolding = {
    account_id: string;
    product_type: 'Checking' | 'Savings' | 'Mortgage' | 'Credit Card' | 'Investment';
    product_name: string;
    balance: number;
    currency: string;
    status: 'Active' | 'Dormant' | 'Closed';
    account_number_masked: string;
};

export type ComplianceData = {
    kyc_status: 'Verified' | 'Pending' | 'Expired';
    kyc_refresh_date: string;
    aml_risk: 'Low' | 'Medium' | 'High';
    pep_flag: boolean;
    sanctions_flag: boolean;
    crs_status: string;
    fatca_status: string;
    mifid_suitability: 'Valid' | 'Review Needed' | 'Expired';
};

export type Interaction = {
    id: string;
    date: string;
    channel: 'Branch' | 'Mobile App' | 'IVR' | 'Email' | 'Meeting';
    summary: string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
    agent_name?: string;
};

export type HierarchyNode = {
    id: string;
    name: string;
    relation: string; // "Spouse", "Child", "Subsidiary", "Parent"
    net_worth?: number;
    children?: HierarchyNode[];
};

// MOCK DATA - "Alexander V. Sterling"
export const MOCK_CUSTOMER: CustomerProfileType = {
    customer_id: "CUST-001",
    full_legal_name: "Alexander V. Sterling",
    entity_type: 'Individual',
    tier: 'Platinum',
    financial_health_score: 94,
    global_id: "GCID-US-8842-1092",
    email: "a.sterling@example.com",
    phone: "+1 (555) 019-2834",
    joined_date: "2018-03-12",
    rm_name: "Sarah Jenkins",
    avatar_url: "https://i.pravatar.cc/150?img=11"
};

export const CustomerProfile: Record<string, CustomerProfileType> = {
    'CUST-001': MOCK_CUSTOMER,
    [MOCK_CUSTOMER.customer_id]: MOCK_CUSTOMER
};

export const MOCK_FINANCIALS: FinancialHolding[] = [
    {
        account_id: "ACC-CHK-001",
        product_type: 'Checking',
        product_name: 'Premier Global Checking',
        balance: 245000.50,
        currency: 'USD',
        status: 'Active',
        account_number_masked: "•••• 4492"
    },
    {
        account_id: "ACC-SAV-002",
        product_type: 'Savings',
        product_name: 'High Yield Savings',
        balance: 1250000.00,
        currency: 'USD',
        status: 'Active',
        account_number_masked: "•••• 9921"
    },
    {
        account_id: "ACC-INV-003",
        product_type: 'Investment',
        product_name: 'Global Equity Portfolio',
        balance: 4850000.75,
        currency: 'USD',
        status: 'Active',
        account_number_masked: "•••• 2210"
    },
    {
        account_id: "ACC-CC-004",
        product_type: 'Credit Card',
        product_name: 'Infinite Reserve Card',
        balance: -12450.00, // Liability
        currency: 'USD',
        status: 'Active',
        account_number_masked: "•••• 1100"
    },
    {
        account_id: "ACC-MTG-005",
        product_type: 'Mortgage',
        product_name: 'Hamptons Estate Loan',
        balance: -2100000.00, // Liability
        currency: 'USD',
        status: 'Active',
        account_number_masked: "•••• 5582"
    }
];

export const MOCK_COMPLIANCE: ComplianceData = {
    kyc_status: 'Verified',
    kyc_refresh_date: '2025-11-15',
    aml_risk: 'Low',
    pep_flag: false,
    sanctions_flag: false,
    crs_status: 'Reportable (US)',
    fatca_status: 'Compliant',
    mifid_suitability: 'Valid'
};

export const MOCK_INTERACTIONS: Interaction[] = [
    {
        id: "INT-001",
        date: '2024-05-18T14:30:00Z',
        channel: 'Meeting',
        summary: 'Annual Portfolio Review with RM',
        sentiment: 'Positive',
        agent_name: 'Sarah Jenkins'
    },
    {
        id: "INT-002",
        date: '2024-05-10T09:15:00Z',
        channel: 'Mobile App',
        summary: 'Large transfer authorization ($50k)',
        sentiment: 'Neutral'
    },
    {
        id: "INT-003",
        date: '2024-04-22T16:45:00Z',
        channel: 'IVR',
        summary: 'Inquiry about wire transfer fees',
        sentiment: 'Neutral'
    },
    {
        id: "INT-004",
        date: '2024-03-30T11:20:00Z',
        channel: 'Branch',
        summary: 'Notary service for real estate doc',
        sentiment: 'Positive',
        agent_name: 'James Wu'
    }
];

export const MOCK_HIERARCHY: HierarchyNode[] = [
    {
        id: 'root',
        name: "Sterling Household",
        relation: "Household",
        net_worth: 12500000,
        children: [
            {
                id: '2',
                name: "Eleanor Sterling",
                relation: "Spouse",
                net_worth: 4200000
            },
            {
                id: '3',
                name: "Sterling Trust, LLC",
                relation: "Family Office",
                net_worth: 2000000
            }
        ]
    }
];

import { insforge, getInsforgeServer } from '@/lib/insforge';


// Helper to get all customers for SSG
export async function getCustomers() {
    try {
        const { data, error } = await insforge.database
            .from('individual_parties')
            .select('id')
            .limit(100);

        if (error || !data || data.length === 0) {
            console.error("No customers in DB, falling back to MOCK_CUSTOMER");
            return [{
                party_id: MOCK_CUSTOMER.customer_id,
                party_type: MOCK_CUSTOMER.entity_type.toLowerCase(),
                individual_parties: [{
                    full_legal_name: MOCK_CUSTOMER.full_legal_name,
                    segment_tier: MOCK_CUSTOMER.tier,
                    nationality: 'US',
                    employment_status: 'Employed'
                }]
            }];
        }

        return data.map((p: any) => ({
            customer_id: p.id,
        }));
    } catch (e) {
        console.error("Failed to fetch customers, falling back to mock:", e);
        return [{
            party_id: MOCK_CUSTOMER.customer_id,
            party_type: MOCK_CUSTOMER.entity_type.toLowerCase(),
            individual_parties: [{
                full_legal_name: MOCK_CUSTOMER.full_legal_name,
                segment_tier: MOCK_CUSTOMER.tier,
                nationality: 'US',
                employment_status: 'Employed'
            }]
        }];
    }
}

export type Customer360 = {
    profile: CustomerProfileType;
    financials: FinancialHolding[];
    compliance: ComplianceData;
    interactions: Interaction[];
    hierarchy: HierarchyNode[];
};

export async function getCustomer360(customerId: string): Promise<Customer360 | null> {
    const id = customerId;
    try {
        console.log(`[getCustomer360] Fetching for ID: ${id}`);

        // 1. Try to fetch from Live Database
        try {
            // Only attempt if it looks like a UUID to avoid Postgres errors
            if (customerId.length > 10) {
                console.log("[getCustomer360] Attempting DB fetch...");
                const serverClient = await getInsforgeServer();
                const { data: ind, error } = await serverClient.database
                    .from('individual_parties')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (ind && !error) {
                    const profile: CustomerProfileType = {
                        customer_id: ind.id,
                        full_legal_name: ind.full_name || "Unknown",
                        entity_type: 'Individual',
                        tier: ind.tier || 'Standard',
                        financial_health_score: ind.financial_health_score || 88,
                        global_id: "GCID-LIVE-" + ind.id.substring(0, 4).toUpperCase(),
                        email: ind.email || "hello@example.com",
                        phone: ind.phone_mobile || "N/A",
                        joined_date: ind.created_at || "2023-01-15",
                        rm_name: ind.assigned_rm || "Unassigned",
                        avatar_url: "https://i.pravatar.cc/150?img=11"
                    };

                    // Fetch Financials
                    const { data: financialData } = await serverClient.database
                        .from('financial_products')
                        .select('*')
                        .eq('customer_id', id);

                    const financials: FinancialHolding[] = financialData?.map((f: any) => ({
                        account_id: f.account_id,
                        product_type: f.product_type,
                        product_name: f.product_name || f.product_type,
                        balance: parseFloat(f.current_balance),
                        currency: f.currency_code,
                        status: f.account_status === 'active' ? 'Active' : 'Closed',
                        account_number_masked: "•••• " + f.account_id.substring(0, 4)
                    })) || [];

                    // Fetch Compliance
                    const { data: complianceData } = await serverClient.database
                        .from('compliance_registry')
                        .select('*')
                        .eq('customer_id', id)
                        .single();

                    const compliance: ComplianceData = complianceData ? {
                        kyc_status: 'Verified',
                        kyc_refresh_date: complianceData.kyc_refresh_due_date,
                        aml_risk: complianceData.aml_risk_rating,
                        pep_flag: complianceData.pep_status_flag,
                        sanctions_flag: false,
                        crs_status: complianceData.crs_tax_residency,
                        fatca_status: complianceData.fatca_classification,
                        mifid_suitability: 'Valid'
                    } : MOCK_COMPLIANCE;

                    return {
                        profile,
                        financials,
                        compliance,
                        interactions: MOCK_INTERACTIONS, // Still Mock
                        hierarchy: MOCK_HIERARCHY        // Still Mock
                    };
                }
            }
        } catch (error) {
            console.error("[getCustomer360] Failed to fetch live data, falling back to mock:", error);
        }

        // 2. Fallback to Local Mock Data
        console.log("[getCustomer360] Falling back to Mock Data...");
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));

        // If ID matches the Mock ID (which we might use for testing) or just return default
        return {
            profile: MOCK_CUSTOMER,
            financials: MOCK_FINANCIALS,
            compliance: MOCK_COMPLIANCE,
            interactions: MOCK_INTERACTIONS,
            hierarchy: MOCK_HIERARCHY
        };
    } catch (criticalError) {
        console.error("[getCustomer360] CRITICAL FAILURE:", criticalError);
        // Fallback to Mock Data on critical failure
        return {
            profile: MOCK_CUSTOMER,
            financials: MOCK_FINANCIALS,
            compliance: MOCK_COMPLIANCE,
            interactions: MOCK_INTERACTIONS,
            hierarchy: MOCK_HIERARCHY
        };
    }
}
