import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool
} from '@modelcontextprotocol/sdk/types.js';
import { ingestLead, updateBANT, convertLeadToOpportunity } from '../services/lead-service';
import { submitCreditApplication, updateCreditDecision } from '../services/credit-service';
import { saveOnboardingProgress, completeOnboarding } from '../services/onboarding-service';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// --- Schema Definitions ---
const IngestLeadSchema = z.object({
    fullname: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    productinterest: z.string()
});

const UpdateBANTSchema = z.object({
    id: z.string().uuid(),
    budget: z.string().optional(),
    authority: z.string().optional(),
    need: z.string().optional(),
    timeline: z.string().optional(),
    notes: z.string().optional()
});

const ConvertLeadSchema = z.object({
    id: z.string().uuid()
});

const SubmitCreditSchema = z.object({
    applicant_name: z.string(),
    business_name: z.string().optional(),
    loan_amount: z.number().positive(),
    product_type: z.string(),
    purpose: z.string().optional(),
    collateral_type: z.string().optional(),
    collateral_value: z.number().optional()
});

const UpdateCreditDecisionSchema = z.object({
    application_id: z.string().uuid(),
    action: z.enum(['Approve', 'Decline', 'Counter_Offer']),
    notes: z.string().optional()
});

const SaveOnboardingProgressSchema = z.object({
    application_id: z.string().uuid().optional(),
    resume_token: z.string().optional(),
    wizard_step: z.number().int().min(1).max(5),
    wizard_state: z.record(z.any()),
    edd_required: z.boolean().optional(),
    full_name: z.string().optional(),
    email: z.string().email().optional()
});

const CompleteOnboardingSchema = z.object({
    application_id: z.string().uuid()
});

// --- Tool Definitions ---

export const BANKING_CRM_TOOLS: Tool[] = [
    {
        name: 'mcp_bankingcrm_ingest_lead',
        description: 'Create a new lead entering the Banking CRM pipeline.',
        inputSchema: zodToJsonSchema(IngestLeadSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_update_bant',
        description: 'Update BANT qualification parameters for a specific lead.',
        inputSchema: zodToJsonSchema(UpdateBANTSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_convert_lead',
        description: 'Convert a qualified Lead into an Opportunity.',
        inputSchema: zodToJsonSchema(ConvertLeadSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_submit_credit_app',
        description: 'Submit a new credit application for instant triaging.',
        inputSchema: zodToJsonSchema(SubmitCreditSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_update_credit_decision',
        description: 'Update the decision on an existing credit application.',
        inputSchema: zodToJsonSchema(UpdateCreditDecisionSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_save_onboarding_progress',
        description: 'Save progress on a customer onboarding wizard application.',
        inputSchema: zodToJsonSchema(SaveOnboardingProgressSchema as any) as any
    },
    {
        name: 'mcp_bankingcrm_complete_onboarding',
        description: 'Mark an onboarding application as fully completed.',
        inputSchema: zodToJsonSchema(CompleteOnboardingSchema as any) as any
    }
];

// --- Server Registration ---

export function registerTools(server: Server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: BANKING_CRM_TOOLS };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            const { name, arguments: args } = request.params;
            let result;

            switch (name) {
                case 'mcp_bankingcrm_ingest_lead': {
                    const parsedArgs = IngestLeadSchema.parse(args);
                    result = await ingestLead(parsedArgs);
                    break;
                }
                case 'mcp_bankingcrm_update_bant': {
                    const parsedArgs = UpdateBANTSchema.parse(args);
                    const { id, ...bantData } = parsedArgs;
                    result = await updateBANT(id, bantData);
                    break;
                }
                case 'mcp_bankingcrm_convert_lead': {
                    const parsedArgs = ConvertLeadSchema.parse(args);
                    result = await convertLeadToOpportunity(parsedArgs.id);
                    break;
                }
                case 'mcp_bankingcrm_submit_credit_app': {
                    const parsedArgs = SubmitCreditSchema.parse(args);
                    result = await submitCreditApplication(parsedArgs);
                    break;
                }
                case 'mcp_bankingcrm_update_credit_decision': {
                    const parsedArgs = UpdateCreditDecisionSchema.parse(args);
                    result = await updateCreditDecision(parsedArgs.application_id, parsedArgs.action, parsedArgs.notes);
                    break;
                }
                case 'mcp_bankingcrm_save_onboarding_progress': {
                    const parsedArgs = SaveOnboardingProgressSchema.parse(args);
                    result = await saveOnboardingProgress(parsedArgs);
                    break;
                }
                case 'mcp_bankingcrm_complete_onboarding': {
                    const parsedArgs = CompleteOnboardingSchema.parse(args);
                    result = await completeOnboarding(parsedArgs.application_id);
                    break;
                }
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }

            if (result.error) {
                return {
                    content: [{ type: 'text', text: `Tool Execution Failed: [${result.error.code}] ${result.error.message}` }],
                    isError: true
                };
            }

            return {
                content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
            };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `Tool Error: ${error.message}` }],
                isError: true
            };
        }
    });
}
