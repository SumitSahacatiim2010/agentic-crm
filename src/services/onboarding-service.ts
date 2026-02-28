import { getInsforgeServer } from '@/lib/insforge';
import { insforge as insforgeClient } from '@/lib/insforge-client';

export interface ServiceResponse<T> {
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: any;
}

export const saveOnboardingProgress = async (body: any): Promise<ServiceResponse<any>> => {
    try {
        const { application_id, resume_token, wizard_step, wizard_state, edd_required, ...rest } = body;
        const now = new Date().toISOString();

        if (!application_id) {
            // First save — insert new row
            const insertPayload: Record<string, unknown> = {
                wizard_step: wizard_step ?? 1,
                wizard_state: wizard_state ?? {},
                edd_required: edd_required ?? false,
                status: 'in_progress',
                updated_at: now,
            };
            if (resume_token) insertPayload.resume_token = resume_token;

            const STEP1_FIELDS = ['full_name', 'email', 'date_of_birth', 'nationality', 'country_of_residence', 'tax_residence_country', 'occupation', 'employment_status', 'phone'];
            STEP1_FIELDS.forEach(f => { if (rest[f] !== undefined) insertPayload[f] = rest[f]; });

            const { data, error } = await insforgeClient.database
                .from('onboarding_applications')
                .insert([insertPayload])
                .select('application_id, resume_token')
                .limit(1);

            if (error) return { error: { code: error.code, message: error.message } };
            return { data: { application_id: (data as any)?.[0]?.application_id, resume_token: (data as any)?.[0]?.resume_token, is_new: true } };
        }

        // Subsequent save — update by application_id
        const updatePayload: Record<string, unknown> = {
            wizard_step: wizard_step ?? 1,
            wizard_state: wizard_state ?? {},
            edd_required: edd_required ?? false,
            updated_at: now,
        };
        const ALL_FIELDS = [
            'full_name', 'email', 'date_of_birth', 'nationality', 'country_of_residence', 'tax_residence_country',
            'occupation', 'employment_status', 'phone',
            'kyc_status', 'kyc_name_score', 'kyc_auth_score', 'kyc_tamper_flag', 'kyc_doc_type', 'kyc_completed_at',
            'cdd_risk_rating', 'cdd_pep_declared', 'cdd_source_of_funds', 'cdd_account_purpose',
            'cdd_high_risk_country', 'cdd_annual_income_band', 'cdd_tx_volume_band', 'cdd_completed_at',
            'fatca_us_person', 'fatca_tin', 'crs_tax_countries', 'crs_tins', 'fatca_crs_declared_at', 'fatca_status',
            'sanctions_outcome', 'sanctions_score', 'sanctions_screened_at', 'preventive_control_log',
            'compliance_case_id', 'account_number', 'sort_code', 'provisioned_at', 'status',
        ];
        ALL_FIELDS.forEach(f => { if (rest[f] !== undefined) updatePayload[f] = rest[f]; });

        const { error } = await insforgeClient.database
            .from('onboarding_applications')
            .update(updatePayload)
            .eq('application_id', application_id);

        if (error) return { error: { code: error.code, message: error.message } };
        return { data: { success: true, application_id } };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
};

export const getOnboardingApplication = async (token: string): Promise<ServiceResponse<any>> => {
    try {
        const { data, error } = await insforgeClient.database
            .from('onboarding_applications')
            .select('*')
            .eq('resume_token', token)
            .limit(1);

        if (error) return { error: { code: error.code, message: error.message } };

        if (!data || (data as any[]).length === 0) {
            return { error: { code: 'NOT_FOUND', message: 'Application not found' } };
        }

        return { data: (data as any)[0] };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
};

export const completeOnboarding = async (applicationId: string): Promise<ServiceResponse<any>> => {
    try {
        const { error } = await insforgeClient.database
            .from('onboarding_applications')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('application_id', applicationId);

        if (error) return { error: { code: error.code, message: error.message } };
        return { data: { success: true, application_id: applicationId } };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: String(e) } };
    }
}
