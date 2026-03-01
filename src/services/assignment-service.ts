import { insforge as insforgeClient } from '@/lib/insforge-client';
import { ServiceResponse, assignLead } from './lead-service';

export const runAssignmentRules = async (leadId: string): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data: lead, error } = await db.from('leads').select('*').eq('id', leadId).single();
        if (error || !lead) return { error: { code: 'NOT_FOUND', message: 'Lead not found' } };

        // For now, implement hardcoded rules based on persona expectations,
        // but structured so they could be driven by table rule_definitions
        let assignedOwner = null;
        let assignedReason = 'Default Round Robin';

        const product = (lead.product_interest || '').toLowerCase();
        const segment = (lead.segment || '').toLowerCase();

        // Corporate RM (Michael Chang)
        if (segment === 'corporate' || segment === 'sme' || product.includes('corporate') || product.includes('treasury')) {
            assignedOwner = 'Michael Chang';
            assignedReason = 'Corporate/SME Segment Routing';
        }
        // Wealth RM (Priya Patel)
        else if (segment === 'wealth' || segment === 'hnw' || product.includes('wealth') || product.includes('investment')) {
            assignedOwner = 'Priya Patel';
            assignedReason = 'Wealth/HNW Segment Routing';
        }
        // General Retail (Sarah Jenkins)
        else {
            assignedOwner = 'Sarah Jenkins';
            assignedReason = 'Retail Default Routing';
        }

        // Apply Assignment via lead-service
        const result = await assignLead(leadId, assignedOwner, 'System Auto-Assign', assignedReason);

        return result;
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};
