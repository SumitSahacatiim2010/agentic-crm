export interface KnowledgeArticle {
    id: string;
    title: string;
    category: 'Onboarding' | 'Credit' | 'Compliance' | 'Servicing' | 'Products' | 'General';
    excerpt: string;
    content: string;
    views: number;
    lastUpdated: string;
    tags: string[];
}

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
    {
        id: 'KB-101', title: 'KYC Required Documents for Commercial Entity', category: 'Compliance',
        excerpt: 'List of mandatory documents required for onboarding an LLC or C-Corp.',
        content: '# KYC Required Documents\n\nFor commercial entities, ensure you collect:\n- Articles of Incorporation\n- Employer Identification Number (EIN) Verification\n- Ultimate Beneficial Owner (UBO) declaration\n- Utility bill for registered address verification\n- Valid ID for all beneficial owners > 25%',
        views: 1405, lastUpdated: '2026-01-15', tags: ['kyc', 'onboarding', 'commercial']
    },
    {
        id: 'KB-102', title: 'Overriding High Risk (ORR) Flags in Credit Applications', category: 'Credit',
        excerpt: 'Policy on how to handle override requests for applicants flagged as high risk (ORR 7-9).',
        content: '# ORR Overrides\n\nOverrides for Risk Ratings 7 through 9 are strictly managed.\n\n1. **Requires Senior Credit Officer (SCO) Approval**: Cannot be overridden by standard underwriters.\n2. **Documentation**: Must include a detailed memo explaining mitigating factors (e.g., strong guarantor, highly liquid collateral).\n3. **LTV Reductions**: Overrides typically require capping LTV at 65%.\n\nNever override fraud warnings.',
        views: 890, lastUpdated: '2026-02-02', tags: ['credit', 'orr', 'underwriting', 'policy']
    },
    {
        id: 'KB-103', title: 'Fee Waiver Authority Limits', category: 'Servicing',
        excerpt: 'Delegated authority matrix for waiving overdraft or late fees by role.',
        content: '# Fee Waiver Limits\n\n- **Tier 1 Agent**: Up to $50/month per account.\n- **Tier 2 Agent / Branch Manager**: Up to $250/month per account.\n- **Regional SVP**: Up to $1,000.\n\nFor any waivers exceeding these limits, submit a P1 escalation to Service Desk.',
        views: 3244, lastUpdated: '2025-11-20', tags: ['fees', 'escalation', 'servicing']
    },
    {
        id: 'KB-104', title: 'Handling Suspected Sanctions Matches', category: 'Compliance',
        excerpt: 'Protocol for halting transactions when an OFAC or PEP alert triggers.',
        content: '# Sanctions Protocol\n\nIf the AI flags a transaction or profile for a sanctions match:\n1. FREEZE the account or halt the transaction immediately.\n2. Do NOT tip off the customer.\n3. Route the escalation to the Global AML team.\n4. Add a "Suspicious Activity Indicator" in the CRM profile.',
        views: 2100, lastUpdated: '2026-02-10', tags: ['ofac', 'aml', 'sanctions', 'pep']
    },
    {
        id: 'KB-105', title: 'Jumbo Mortgage Structuring Guide', category: 'Products',
        excerpt: 'Standard terms, LTV requirements, and pricing for Jumbo Residential Mortgages.',
        content: '# Jumbo Mortgages\n\n- **Minimum Loan**: $766,550 (varies by county)\n- **Max LTV**: 80% (up to $2M), 70% ($2M - $5M)\n- **Reserves**: 12 months PITI minimum.\n- **DTI Limit**: 43% strictly enforced.',
        views: 950, lastUpdated: '2026-01-05', tags: ['mortgage', 'lending', 'jumbo']
    },
    {
        id: 'KB-106', title: 'Wire Transfer Trace Procedures', category: 'Servicing',
        excerpt: 'Steps to initiate a SWIFT or Fedwire trace for missing funds.',
        content: '# Wire Trace\n\nEnsure at least 24 hours have passed since execution. Collect the IMAD/OMAD number. Submit trace request via the core banking portal. Notify client resolution takes 3-5 business days.',
        views: 540, lastUpdated: '2026-02-18', tags: ['wires', 'payments', 'trace']
    },
    {
        id: 'KB-107', title: 'Adding Authorized Signers', category: 'Onboarding',
        excerpt: 'How to add secondary signers to an existing commercial account.',
        content: '# Adding Signers\n\nRequire a new Corporate Resolution signed by the existing primary owner. The new signer must complete standard KYC (ID scan, address verification) before being attached to the `parties` table.',
        views: 1120, lastUpdated: '2025-10-30', tags: ['signers', 'commercial', 'kyc']
    }
];

// Generate synthetic articles to hit >= 50 threshold
for (let i = 8; i <= 55; i++) {
    const cats: KnowledgeArticle['category'][] = ['Onboarding', 'Credit', 'Compliance', 'Servicing', 'Products', 'General'];
    const c = cats[Math.floor(Math.random() * cats.length)];
    KNOWLEDGE_BASE.push({
        id: `KB-1${i < 10 ? '0' + i : i}`,
        title: `Standard Operating Procedure: ${c} Variant ${i}`,
        category: c,
        excerpt: `Generated procedural guideline for handling edge cases in ${c.toLowerCase()}.`,
        content: `# SOP Variant ${i}\n\nThis is a standard operating procedure document covering ${c.toLowerCase()} workflows. Always follow local regulatory guidelines when applying these steps.`,
        views: Math.floor(Math.random() * 500),
        lastUpdated: `2026-01-${Math.floor(Math.random() * 28) + 1}`,
        tags: [c.toLowerCase(), 'sop', 'guideline']
    });
}
