CREATE TABLE IF NOT EXISTS public.service_cases (
    case_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.parties(party_id),
    subject character varying(255),
    description text,
    status character varying(50) DEFAULT 'open',
    priority character varying(50) DEFAULT 'medium',
    sla_deadline timestamp with time zone,
    resolution text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    channel text DEFAULT 'branch',
    priority_band text DEFAULT 'P3',
    is_regulatory boolean DEFAULT false,
    acknowledged_at timestamp with time zone,
    resolved_at timestamp with time zone,
    closed_at_case timestamp with time zone
);
CREATE INDEX IF NOT EXISTS idx_cases_channel ON public.service_cases (channel);
CREATE INDEX IF NOT EXISTS idx_cases_priority_status ON public.service_cases (priority_band, status);
CREATE INDEX IF NOT EXISTS idx_cases_regulatory ON public.service_cases (is_regulatory) WHERE (is_regulatory = true);
CREATE INDEX IF NOT EXISTS idx_cases_status_priority ON public.service_cases (status, priority, sla_deadline);

ALTER TABLE public.service_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write srv" ON public.service_cases FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.onboarding_applications (
    application_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text,
    email text,
    date_of_birth date,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    resume_token uuid UNIQUE DEFAULT gen_random_uuid(),
    wizard_step integer DEFAULT 1,
    wizard_state jsonb DEFAULT '{}'::jsonb,
    edd_required boolean DEFAULT false,
    nationality text,
    country_of_residence text,
    tax_residence_country text,
    occupation text,
    employment_status text,
    phone text,
    kyc_status text DEFAULT 'pending',
    kyc_name_score integer,
    kyc_auth_score integer,
    kyc_tamper_flag boolean DEFAULT false,
    kyc_doc_type text,
    kyc_completed_at timestamp with time zone,
    cdd_risk_rating text DEFAULT 'Low',
    cdd_pep_declared boolean DEFAULT false,
    cdd_source_of_funds text[],
    cdd_account_purpose text[],
    cdd_high_risk_country boolean DEFAULT false,
    cdd_annual_income_band text,
    cdd_tx_volume_band text,
    cdd_completed_at timestamp with time zone,
    fatca_us_person boolean DEFAULT false,
    fatca_tin text,
    crs_tax_countries text[],
    crs_tins jsonb DEFAULT '{}'::jsonb,
    fatca_crs_declared_at timestamp with time zone,
    fatca_status text DEFAULT 'not_applicable',
    sanctions_outcome text,
    sanctions_score integer,
    sanctions_screened_at timestamp with time zone,
    preventive_control_log text,
    compliance_case_id uuid REFERENCES public.service_cases(case_id) ON DELETE SET NULL,
    account_number text,
    sort_code text,
    provisioned_at timestamp with time zone
);
CREATE INDEX IF NOT EXISTS idx_onboarding_edd ON public.onboarding_applications (edd_required) WHERE (edd_required = true);
CREATE INDEX IF NOT EXISTS idx_onboarding_sanctions ON public.onboarding_applications (sanctions_outcome) WHERE (sanctions_outcome IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding_applications (status);

ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_onboarding" ON public.onboarding_applications FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.onboarding_edd_records (
    edd_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL UNIQUE REFERENCES public.onboarding_applications(application_id) ON DELETE CASCADE,
    wealth_narrative text,
    country_of_risk text,
    doc_type_submitted text,
    sponsoring_entity text,
    business_reg_number text,
    net_worth_band text,
    third_party_tx boolean DEFAULT false,
    third_party_purpose text,
    reviewer_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.onboarding_edd_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_edd" ON public.onboarding_edd_records FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.credit_applications (
    application_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.parties(party_id) ON DELETE SET NULL,
    opportunity_id uuid REFERENCES public.sales_opportunities(opportunity_id) ON DELETE SET NULL,
    applicant_name text NOT NULL,
    business_name text,
    loan_amount numeric NOT NULL,
    product_type text NOT NULL,
    purpose text,
    collateral_type text,
    collateral_value numeric DEFAULT 0,
    status text DEFAULT 'pending_triage',
    routing_path text DEFAULT 'Standard',
    risk_rating integer DEFAULT 5,
    credit_score integer,
    fraud_flag boolean DEFAULT false,
    assigned_to text,
    doa_level text,
    decision text,
    decision_at timestamp with time zone,
    decision_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_apps_customer ON public.credit_applications (customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_apps_routing ON public.credit_applications (routing_path);
CREATE INDEX IF NOT EXISTS idx_credit_apps_status ON public.credit_applications (status);

ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_credit_apps" ON public.credit_applications FOR ALL TO public USING (true) WITH CHECK (true);
