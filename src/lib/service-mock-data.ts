
export type CaseStatus = 'New' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
export type Channel = 'Web' | 'Phone' | 'Branch' | 'Chatbot';
export type Priority = 'High' | 'Medium' | 'Low';

export interface ServiceCase {
    id: string;
    case_id?: string; // API alias
    customer_id?: string;
    customerId?: string; // Legacy/Migration compatibility
    customerName?: string;
    customer_name?: string;
    subject: string;
    channel: string;
    status: string;
    priority: string;
    priority_band?: string;
    is_regulatory?: boolean;
    sla_deadline?: string;
    slaDeadline?: string; // Legacy/Migration compatibility
    created_at?: string;
    createdAt?: string; // Legacy/Migration compatibility
    category?: string;
    case_type?: string;
}

export interface KnowledgeArticle {
    id: string;
    title: string;
    category: string;
    snippet: string;
}

const NOW = new Date();
const ONE_HOUR = 60 * 60 * 1000;

export const MOCK_CASES: ServiceCase[] = [
    {
        id: 'CAS-1024',
        customerId: 'CUST-001',
        customerName: 'Michael Scott',
        subject: 'Unrecognized Transaction on Corp Card',
        channel: 'Phone',
        status: 'In Progress',
        priority: 'High',
        slaDeadline: new Date(NOW.getTime() + ONE_HOUR * 2).toISOString(), // 2 hours left
        createdAt: new Date(NOW.getTime() - ONE_HOUR * 2).toISOString(),
        category: 'Dispute'
    },
    {
        id: 'CAS-1025',
        customerId: 'CUST-002',
        customerName: 'Dwight Schrute',
        subject: 'Request for Loan Restructuring',
        channel: 'Branch',
        status: 'New',
        priority: 'Medium',
        slaDeadline: new Date(NOW.getTime() + ONE_HOUR * 20).toISOString(), // 20 hours left
        createdAt: new Date(NOW.getTime() - ONE_HOUR).toISOString(),
        category: 'Lending'
    },
    {
        id: 'CAS-1026',
        customerId: 'CUST-003',
        customerName: 'Stanley Hudson',
        subject: 'Access Locked - Password Reset Failed',
        channel: 'Web',
        status: 'Escalated',
        priority: 'High',
        slaDeadline: new Date(NOW.getTime() - ONE_HOUR * 1).toISOString(), // BREACHED (-1 hour)
        createdAt: new Date(NOW.getTime() - ONE_HOUR * 25).toISOString(),
        category: 'Access'
    },
    {
        id: 'CAS-1027',
        customerId: 'CUST-004',
        customerName: 'Pam Beesly',
        subject: ' Inquiry about Debit Card Limits',
        channel: 'Chatbot',
        status: 'Resolved',
        priority: 'Low',
        slaDeadline: new Date(NOW.getTime() + ONE_HOUR * 48).toISOString(),
        createdAt: new Date(NOW.getTime() - ONE_HOUR * 5).toISOString(),
        category: 'General'
    }
];

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
    { id: 'KB-001', category: 'Dispute', title: 'Reg E Dispute Resolution Process', snippet: 'Federal law requires investigating EFT errors within 10 business days. Provisional credit must be issued if investigation takes longer.' },
    { id: 'KB-002', category: 'Dispute', title: 'Card Fraud vs. Merchant Dispute', snippet: 'Distinguish between unauthorized use (Fraud) and billing errors (Merchant Dispute) to select the correct chargeback code.' },
    { id: 'KB-003', category: 'Lending', title: 'Commercial Loan Modification Guidelines', snippet: 'Restructuring requires current financials (P&L, Balance Sheet) and credit committee approval for adjustments > $50k.' },
    { id: 'KB-004', category: 'Access', title: 'Identity Verification for Account Unlock', snippet: 'Agent must verify 2 factors: OTP sent to file mobile, or recent transaction verification.' },
];
