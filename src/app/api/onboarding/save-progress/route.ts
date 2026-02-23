// POST /api/onboarding/save-progress
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
            // Merge step-1 personal fields if present
            const STEP1_FIELDS = ['full_name', 'email', 'date_of_birth', 'nationality', 'country_of_residence', 'tax_residence_country', 'occupation', 'employment_status', 'phone'];
            STEP1_FIELDS.forEach(f => { if (rest[f] !== undefined) insertPayload[f] = rest[f]; });

            const { data, error } = await insforge.database
                .from('onboarding_applications')
                .insert([insertPayload])
                .select('application_id, resume_token')
                .limit(1);

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ application_id: (data as any)?.[0]?.application_id, resume_token: (data as any)?.[0]?.resume_token }, { status: 201 });
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

        const { error } = await insforge.database
            .from('onboarding_applications')
            .update(updatePayload)
            .eq('application_id', application_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, application_id });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
