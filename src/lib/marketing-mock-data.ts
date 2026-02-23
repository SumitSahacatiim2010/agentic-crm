
export type NodeType = 'trigger' | 'logic' | 'action';

export interface CampaignNode {
    id: string;
    type: NodeType;
    label: string;
    icon: string;
    description: string;
    node_action?: string;   // P7: maps to CRM artifact or fatigue channel
}

export const NODE_LIBRARY: CampaignNode[] = [
    // Triggers
    { id: 'trig-1', type: 'trigger', label: 'High Value Deposit', icon: 'Wallet', description: 'Trigger when deposit > $10k' },
    { id: 'trig-2', type: 'trigger', label: 'Account Anniversary', icon: 'Calendar', description: 'Trigger on yearly anniversary' },
    { id: 'trig-3', type: 'trigger', label: 'HNW Tax Optimization', icon: 'Wallet', description: 'Target AUM > $500k + year-end' },
    { id: 'trig-4', type: 'trigger', label: 'Card Activation', icon: 'CreditCard', description: 'Trigger when new card is activated' },
    { id: 'trig-5', type: 'trigger', label: 'Lifecycle: Dormancy', icon: 'Clock', description: 'No transactions for 60+ days' },
    { id: 'trig-6', type: 'trigger', label: 'Mobile App Install', icon: 'Smartphone', description: 'First mobile app login' },
    // Logic
    { id: 'logic-1', type: 'logic', label: 'Check Credit Score', icon: 'Split', description: 'Branch based on FICO > 700' },
    { id: 'logic-2', type: 'logic', label: 'Check Consent', icon: 'Shield', description: 'Verify marketing opt-in', node_action: 'check_consent' },
    { id: 'logic-3', type: 'logic', label: 'Segment: AUM > $500k', icon: 'Split', description: 'Filter by wealth tier' },
    { id: 'logic-4', type: 'logic', label: 'Frequency Cap Check', icon: 'Shield', description: 'Block if fatigue limit hit', node_action: 'check_fatigue' },
    { id: 'logic-5', type: 'logic', label: 'Spend Tier Gate', icon: 'Split', description: 'Branch by monthly spend tier' },
    { id: 'logic-6', type: 'logic', label: 'Product Holding Check', icon: 'Shield', description: 'Branch by existing product', node_action: 'check_product' },
    // Actions
    { id: 'act-1', type: 'action', label: 'Send Email', icon: 'Mail', description: 'Send personalized email', node_action: 'send_email' },
    { id: 'act-2', type: 'action', label: 'Push Notification', icon: 'Smartphone', description: 'Send mobile app push', node_action: 'send_push' },
    { id: 'act-3', type: 'action', label: 'Assign Task to RM', icon: 'UserCheck', description: 'Create CRM task for RM', node_action: 'assign_task' },
    { id: 'act-4', type: 'action', label: 'Spawn Qualified Lead', icon: 'UserCheck', description: 'Insert lead into pipeline', node_action: 'spawn_lead' },
    { id: 'act-5', type: 'action', label: 'Send SMS', icon: 'Smartphone', description: 'Send SMS notification', node_action: 'send_sms' },
    { id: 'act-6', type: 'action', label: 'In-App Message', icon: 'MessageCircle', description: 'Show in-app banner or modal', node_action: 'in_app_msg' },
    { id: 'act-7', type: 'action', label: 'Referral Program', icon: 'Users', description: 'Enroll in referral campaign', node_action: 'referral' },
    { id: 'act-8', type: 'action', label: 'Schedule NPS Survey', icon: 'ClipboardList', description: 'Trigger CSAT/NPS survey', node_action: 'survey' },
];

export const CAMPAIGN_METRICS = {
    totalAudience: 15420,
    dncMatches: 245,
    gdprOptOuts: 1105,
    tcpaLimits: 320,
    costPerAcquisition: 45.20,
    roas: 4.8, // 480%
    roi: 125, // 125%
    deliveryRate: 98.5,
    clickThroughRate: 3.4
};

export const AB_TEST_RESULTS = {
    variantA: { label: 'Subject: "Exclusive Offer"', conversion: 2.1 },
    variantB: { label: 'Subject: "You are invited"', conversion: 3.8 },
    confidence: 96, // 96% Statistical Significance
    winner: 'variantB'
};
