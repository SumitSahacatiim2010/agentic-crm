/**
 * Phase 7: Gemini Function Declarations
 *
 * Maps Phase 6 headless microservices to Gemini-compatible
 * FunctionDeclaration objects for native tool-calling.
 */
import { Type } from '@google/genai';

export const crmToolDeclarations = [
    {
        name: 'ingest_lead',
        description: 'Create a new lead in the CRM system. Use this when a user asks you to add, create, or register a new lead or prospect.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                full_name: { type: Type.STRING, description: 'Full name of the lead' },
                email: { type: Type.STRING, description: 'Email address' },
                phone: { type: Type.STRING, description: 'Phone number' },
                source_channel: { type: Type.STRING, description: 'Lead source (e.g., Walk-in, Website, Referral, Campaign)' },
                product_interest: { type: Type.STRING, description: 'Product the lead is interested in' },
                segment: { type: Type.STRING, description: 'Customer segment (Retail, Corporate, SME, HNW)' },
                branch_id: { type: Type.STRING, description: 'Branch ID if known' },
                assigned_rm: { type: Type.STRING, description: 'Assigned relationship manager' },
            },
            required: ['full_name'],
        },
    },
    {
        name: 'update_lead',
        description: 'Update general information for an existing lead (e.g., residency_status, id_type, age_confirmed, source_channel, email, phone, full_name, etc). Do not use this for BANT scores (use update_bant).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                lead_id: { type: Type.STRING, description: 'UUID of the lead to update' },
                full_name: { type: Type.STRING, description: 'Full name' },
                email: { type: Type.STRING, description: 'Email address' },
                phone: { type: Type.STRING, description: 'Phone number' },
                residency_status: { type: Type.STRING, description: 'Residency status (e.g., Citizen, Permanent Resident, Non-Resident)' },
                id_type: { type: Type.STRING, description: 'ID Type (e.g., Passport, National ID, Driver License)' },
                age_confirmed: { type: Type.BOOLEAN, description: 'Is age >= 18 confirmed?' },
                source_channel: { type: Type.STRING, description: 'Lead source channel' },
                notes: { type: Type.STRING, description: 'Additional notes' }
            },
            required: ['lead_id'],
        },
    },
    {
        name: 'update_bant',
        description: 'Update BANT qualification flags for an existing lead. BANT = Budget, Authority, Need, Timeline. Each is true/false.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                lead_id: { type: Type.STRING, description: 'UUID of the lead to update' },
                bant_budget: { type: Type.BOOLEAN, description: 'Does the lead have budget? true/false' },
                bant_authority: { type: Type.BOOLEAN, description: 'Is the lead a decision-maker? true/false' },
                bant_need: { type: Type.BOOLEAN, description: 'Does the lead have a clear need? true/false' },
                bant_timeline: { type: Type.BOOLEAN, description: 'Is there an active timeline? true/false' },
            },
            required: ['lead_id'],
        },
    },
    {
        name: 'convert_lead_to_opportunity',
        description: 'Convert a qualified lead into a sales opportunity. Creates an opportunity record and marks the lead as Converted.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                lead_id: { type: Type.STRING, description: 'UUID of the lead to convert' },
            },
            required: ['lead_id'],
        },
    },
    {
        name: 'create_opportunity',
        description: 'Create a new sales opportunity directly (without converting from a lead).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                customer_id: { type: Type.STRING, description: 'Customer UUID' },
                deal_name: { type: Type.STRING, description: 'Name of the deal' },
                pipeline_stage: { type: Type.STRING, description: 'Pipeline stage (Prospecting, Qualification, Proposal, Negotiation, Closed-Won, Closed-Lost)' },
                deal_value: { type: Type.NUMBER, description: 'Projected deal value in USD' },
                probability: { type: Type.NUMBER, description: 'Win probability percentage 0-100' },
                assigned_rm: { type: Type.STRING, description: 'Assigned relationship manager' },
            },
            required: ['deal_name'],
        },
    },
    {
        name: 'save_onboarding_progress',
        description: 'Save a customer onboarding wizard progress. Persists the current step and form state.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                application_id: { type: Type.STRING, description: 'Existing application UUID (omit for new)' },
                wizard_step: { type: Type.NUMBER, description: 'Current wizard step (1-5)' },
                full_name: { type: Type.STRING, description: 'Applicant full name' },
                email: { type: Type.STRING, description: 'Applicant email' },
                edd_required: { type: Type.BOOLEAN, description: 'Whether enhanced due diligence is required' },
            },
            required: ['wizard_step'],
        },
    },
    {
        name: 'submit_credit_application',
        description: 'Submit a new credit application for underwriting. Runs credit scoring, risk rating, fraud detection, and triage routing.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                applicant_name: { type: Type.STRING, description: 'Name of the applicant' },
                business_name: { type: Type.STRING, description: 'Business/company name' },
                loan_amount: { type: Type.NUMBER, description: 'Requested loan amount in USD' },
                product_type: { type: Type.STRING, description: 'Loan product type (Term Loan, Line of Credit, Mortgage, Auto, etc.)' },
                purpose: { type: Type.STRING, description: 'Purpose of the loan' },
                collateral_type: { type: Type.STRING, description: 'Collateral type if any' },
                collateral_value: { type: Type.NUMBER, description: 'Collateral value in USD' },
            },
            required: ['applicant_name', 'loan_amount', 'product_type'],
        },
    },
    {
        name: 'update_credit_decision',
        description: 'Record an underwriting decision on a credit application (Approve, Decline, or Counter Offer).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                application_id: { type: Type.STRING, description: 'Credit application UUID' },
                action: { type: Type.STRING, description: 'Decision action: Approve, Decline, or Counter_Offer' },
                notes: { type: Type.STRING, description: 'Decision notes / rationale' },
            },
            required: ['application_id', 'action'],
        },
    },
    {
        name: 'get_leads',
        description: 'Retrieve a list of leads from the CRM. Optionally filter by status.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, description: 'Filter by status (New, Contacted, Qualified, Converted, Lost)' },
                limit: { type: Type.NUMBER, description: 'Max results (default 50)' },
                page: { type: Type.NUMBER, description: 'Page number (default 1)' },
            },
        },
    },
    {
        name: 'get_lead_by_id',
        description: 'Get details of a specific lead by its UUID.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                lead_id: { type: Type.STRING, description: 'UUID of the lead' },
            },
            required: ['lead_id'],
        },
    },
    {
        name: 'get_opportunities',
        description: 'Retrieve a list of sales opportunities. Optionally filter by stage.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                stage: { type: Type.STRING, description: 'Filter by pipeline stage' },
                limit: { type: Type.NUMBER, description: 'Max results (default 50)' },
                page: { type: Type.NUMBER, description: 'Page number (default 1)' },
            },
        },
    },
    {
        name: 'get_opportunity_by_id',
        description: 'Get details of a specific sales opportunity by its UUID.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                opportunity_id: { type: Type.STRING, description: 'UUID of the opportunity' },
            },
            required: ['opportunity_id'],
        },
    },
    {
        name: 'get_credit_applications',
        description: 'Retrieve a list of credit applications. Optionally filter by status.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, description: 'Filter by status' },
                limit: { type: Type.NUMBER, description: 'Max results (default 50)' },
                page: { type: Type.NUMBER, description: 'Page number (default 1)' },
            },
        },
    },
];
