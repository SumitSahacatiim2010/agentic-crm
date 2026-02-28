// Remove unused getInsforgeServer
import { insforge as insforgeClient } from '@/lib/insforge-client';
import { computeCreditScore, computeRiskRating, computeFraudFlag, computeTriageRouting } from '@/lib/credit-scoring';
import { writeAuditEntry } from '@/lib/audit';
import { ServiceResponse } from './onboarding-service';

export const submitCreditApplication = async (body: any): Promise<ServiceResponse<any>> => {
    try {
        const { applicant_name, business_name, loan_amount, product_type, purpose, collateral_type, collateral_value, customer_id, opportunity_id } = body;
        if (!applicant_name || !loan_amount || !product_type) {
            return { error: { code: 'BAD_REQUEST', message: 'applicant_name, loan_amount, product_type required' } };
        }

        const credit_score = computeCreditScore(applicant_name);
        const risk_rating = computeRiskRating(applicant_name, loan_amount);
        const fraud_flag = computeFraudFlag(applicant_name);
        const routing_path = computeTriageRouting(credit_score, loan_amount, risk_rating, fraud_flag, product_type);
        const status = routing_path === 'STP' ? 'Underwriting' : 'Pending Triage';

        const db = insforgeClient.database;
        const { data, error } = await db.from('credit_applications').insert([{
            applicant_name,
            company_name: business_name,
            requested_amount: loan_amount,
            loan_type: product_type,
            fico_score: credit_score,
            orr_rating: `ORR-${risk_rating}`,
            route_type: routing_path,
            status,
            customer_id: customer_id || null,
            policy_check_result: { purpose, collateral_type, collateral_value, fraud_flag, opportunity_id }
        }]).select('id, route_type, fico_score, orr_rating, status, policy_check_result');

        if (error) return { error: { code: error.code, message: error.message } };
        const row = (data as any)?.[0];

        return {
            data: {
                application_id: row?.id,
                routing_path: row?.route_type,
                credit_score: row?.fico_score,
                risk_rating: Number(row?.orr_rating),
                fraud_flag: row?.policy_check_result?.fraud_flag,
                status: row?.status
            }
        };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
};

export const updateCreditDecision = async (application_id: string, action: string, notes?: string): Promise<ServiceResponse<any>> => {
    try {
        if (!application_id || !action) {
            return { error: { code: 'BAD_REQUEST', message: 'application_id and action are required' } };
        }

        let newStatus = '';
        if (action === 'Approve') newStatus = 'approved';
        else if (action === 'Decline') newStatus = 'declined';
        else if (action === 'Counter_Offer') newStatus = 'conditionally_approved';
        else return { error: { code: 'BAD_REQUEST', message: `Invalid action: ${action}` } };

        const { error: updateError } = await insforgeClient.database.from('credit_applications').update({
            status: newStatus,
            decision: newStatus === 'conditionally_approved' ? 'refer' : newStatus === 'declined' ? 'decline' : 'approve',
            decision_at: new Date().toISOString()
        }).eq('application_id', application_id);

        if (updateError) {
            return { error: { code: updateError.code, message: updateError.message } };
        }

        await writeAuditEntry({
            entity_name: 'credit_applications',
            entity_id: application_id,
            action: `decision_${action.toLowerCase()}`,
            changes: { status: newStatus, notes },
            actor_persona: 'UNDERWRITER',
            regulatory_domain: 'CREDIT',
            action_class: 'UPDATE',
            reason: notes || `Underwriter marked application as ${action}`
        });

        return { data: { success: true, status: newStatus } };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
};

export const getCreditApplications = async (params: { limit?: number; page?: number; status?: string }): Promise<ServiceResponse<any[]>> => {
    try {
        const limit = params.limit || 50;
        const page = params.page || 1;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const db = insforgeClient.database;
        let query = db
            .from('credit_applications')
            .select('*, individual_parties(full_name), corporate_parties(legal_name)', { count: 'exact' });

        if (params.status) query = query.eq('status', params.status);

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        const mappedData = (data || []).map((row: any) => ({
            ...row,
            application_id: row.id,
            business_name: row.company_name,
            loan_amount: row.requested_amount,
            product_type: row.loan_type,
            purpose: row.policy_check_result?.purpose || '',
            routing_path: row.route_type,
            risk_rating: Number(row.orr_rating || 0),
            credit_score: row.fico_score,
            fraud_flag: row.policy_check_result?.fraud_flag || false,
        }));

        return {
            data: mappedData,
            meta: { total: count, limit, page }
        };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
}
