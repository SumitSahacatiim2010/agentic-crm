/**
 * Phase 7: Tool Executor
 *
 * Dispatches Gemini functionCall objects to the correct
 * Phase 6 headless microservice.
 */
import { ingestLead, updateBANT, convertLeadToOpportunity, getLeads, getLeadById } from '@/services/lead-service';
import { createOpportunity, getOpportunities } from '@/services/opportunity-service';
import { saveOnboardingProgress } from '@/services/onboarding-service';
import { submitCreditApplication, updateCreditDecision, getCreditApplications } from '@/services/credit-service';

export interface ToolCallResult {
    name: string;
    result: any;
    error?: string;
}

const toolMap: Record<string, (args: any) => Promise<any>> = {
    ingest_lead: (args) => ingestLead(args),
    update_bant: (args) => updateBANT(args.lead_id, args),
    convert_lead_to_opportunity: (args) => convertLeadToOpportunity(args.lead_id),
    create_opportunity: (args) => createOpportunity(args),
    save_onboarding_progress: (args) => saveOnboardingProgress(args),
    submit_credit_application: (args) => submitCreditApplication(args),
    update_credit_decision: (args) => updateCreditDecision(args.application_id, args.action, args.notes),
    get_leads: (args) => getLeads(args || {}),
    get_lead_by_id: (args) => getLeadById(args.lead_id),
    get_opportunities: (args) => getOpportunities(args || {}),
    get_credit_applications: (args) => getCreditApplications(args || {}),
};

/**
 * Execute a tool call from Gemini and return the result.
 */
export async function executeTool(name: string, args: Record<string, any>): Promise<ToolCallResult> {
    const handler = toolMap[name];
    if (!handler) {
        return { name, result: null, error: `Unknown tool: ${name}` };
    }

    try {
        const result = await handler(args);
        return { name, result };
    } catch (err: any) {
        return { name, result: null, error: err.message || String(err) };
    }
}

/** List of all registered tool names */
export const registeredTools = Object.keys(toolMap);
