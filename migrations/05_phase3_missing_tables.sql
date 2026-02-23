-- Missing Tables from Phase 2/3 Prompts 4-6
-- Adapted to reference individual_parties(id) instead of parties(party_id)

-- 1. Onboarding
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
    account_number text,
    sort_code text,
    provisioned_at timestamp with time zone
);

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

CREATE TABLE IF NOT EXISTS public.onboarding_documents (
    document_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.onboarding_applications(application_id) ON DELETE CASCADE,
    doc_type character varying(50) NOT NULL,
    file_url text NOT NULL,
    verification_status character varying(50) DEFAULT 'unverified',
    extracted_data jsonb,
    uploaded_at timestamp with time zone DEFAULT now(),
    verified_at timestamp with time zone,
    ai_confidence_score numeric
);

CREATE TABLE IF NOT EXISTS public.onboarding_kyc_checks (
    check_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.onboarding_applications(application_id) ON DELETE CASCADE,
    provider character varying(100) NOT NULL,
    check_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    raw_response jsonb,
    completed_at timestamp with time zone DEFAULT now(),
    risk_score integer
);


-- 2. Credit Extension (credit_applications already exists in schema.sql)
CREATE TABLE IF NOT EXISTS public.credit_bureau_reports (
    report_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    bureau_name text DEFAULT 'Experian Commercial',
    fico_score integer,
    delinquency_30_count integer DEFAULT 0,
    delinquency_60_count integer DEFAULT 0,
    delinquency_90_count integer DEFAULT 0,
    public_records integer DEFAULT 0,
    bankruptcies integer DEFAULT 0,
    trade_lines_open integer DEFAULT 0,
    on_time_pct numeric DEFAULT 100,
    pulled_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_financial_spreads (
    spread_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL UNIQUE REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    revenue numeric DEFAULT 0,
    cogs numeric DEFAULT 0,
    gross_profit numeric DEFAULT 0,
    operating_expenses numeric DEFAULT 0,
    ebitda numeric DEFAULT 0,
    depreciation numeric DEFAULT 0,
    interest_expense numeric DEFAULT 0,
    net_income numeric DEFAULT 0,
    total_assets numeric DEFAULT 0,
    total_liabilities numeric DEFAULT 0,
    total_equity numeric DEFAULT 0,
    current_assets numeric DEFAULT 0,
    current_liabilities numeric DEFAULT 0,
    working_capital numeric DEFAULT 0,
    dscr numeric,
    dti_pct numeric,
    ltv_pct numeric,
    current_ratio numeric,
    debt_to_equity numeric,
    annual_debt_service numeric DEFAULT 0,
    monthly_income numeric DEFAULT 0,
    monthly_debt numeric DEFAULT 0,
    analyst_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_offers (
    offer_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
    product_type text NOT NULL,
    base_rate numeric NOT NULL,
    risk_spread numeric NOT NULL,
    final_rate numeric NOT NULL,
    exception_premium numeric DEFAULT 0,
    term_months integer NOT NULL,
    approved_amount numeric NOT NULL,
    conditions text[],
    doa_level_required text,
    doa_approved boolean DEFAULT false,
    doa_approver text,
    doa_approved_at timestamp with time zone,
    discount_requested numeric DEFAULT 0,
    discount_approved boolean DEFAULT false,
    status text DEFAULT 'draft',
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_policy_results (
    result_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    rule_id text NOT NULL,
    rule_type text NOT NULL,
    triggered boolean DEFAULT false,
    decline_code text,
    required_action text,
    exception_doc text,
    evaluated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_adverse_actions (
    action_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    decline_codes text[] NOT NULL,
    reason_text text NOT NULL,
    bureau_disclosure text,
    ecoa_notice text,
    generated_at timestamp with time zone DEFAULT now()
);


-- 3. Case Extension (service_cases already exists)
-- Note: replacing service_cases(case_id) with service_cases(id) based on schema.sql
CREATE TABLE IF NOT EXISTS public.case_complaint_details (
    complaint_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.service_cases(id) ON DELETE CASCADE,
    complaint_type character varying(100) NOT NULL,
    financial_impact numeric,
    regulatory_reportable boolean DEFAULT false,
    root_cause text,
    compensation_offered numeric,
    ombudsman_referred boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.case_sla_events (
    event_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.service_cases(id) ON DELETE CASCADE,
    event_type character varying(50) NOT NULL,
    event_timestamp timestamp with time zone DEFAULT now(),
    old_status character varying(50),
    new_status character varying(50),
    sla_breached boolean DEFAULT false
);

-- 4. Compliance Extension (aml_alerts and kyc_records already exist)
CREATE TABLE IF NOT EXISTS public.compliance_profiles (
    compliance_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid UNIQUE REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    kyc_status character varying(50) DEFAULT 'pending',
    kyc_last_review timestamp with time zone,
    kyc_next_review timestamp with time zone,
    aml_risk_rating character varying(50) DEFAULT 'low',
    fatca_crs_status character varying(50),
    pep_status boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.compliance_resolutions (
    resolution_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    resolution_type text NOT NULL,
    resolved_by text DEFAULT 'compliance_officer',
    notes text,
    evidence_ref text,
    sar_reference text,
    previous_status text,
    new_status text,
    unblocked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rm_alerts (
    alert_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    alert_type character varying(50) NOT NULL,
    message text NOT NULL,
    priority character varying(20) DEFAULT 'medium',
    status character varying(20) DEFAULT 'unread',
    created_at timestamp with time zone DEFAULT now(),
    action_url text
);

CREATE TABLE IF NOT EXISTS public.sanctions_logs (
    log_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    screened_at timestamp with time zone DEFAULT now(),
    status character varying(50),
    match_details jsonb
);

-- 5. Knowledge Base
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    article_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(100),
    status character varying(50) DEFAULT 'draft',
    tags text[],
    author_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    view_count integer DEFAULT 0,
    helpful_score integer DEFAULT 0,
    regulatory_approved boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.knowledge_feedback (
    feedback_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id uuid NOT NULL REFERENCES public.knowledge_articles(article_id) ON DELETE CASCADE,
    user_id uuid,
    is_helpful boolean NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Marketing
CREATE TABLE IF NOT EXISTS public.marketing_journeys (
    journey_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    status text DEFAULT 'draft',
    campaign_type text,
    created_by text DEFAULT 'MARKETING_MANAGER',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journey_executions (
    execution_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id uuid REFERENCES public.marketing_journeys(journey_id) ON DELETE CASCADE,
    executed_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'completed',
    leads_created integer DEFAULT 0,
    tasks_created integer DEFAULT 0,
    emails_queued integer DEFAULT 0,
    sms_queued integer DEFAULT 0,
    push_queued integer DEFAULT 0,
    suppressed_fatigue integer DEFAULT 0,
    suppressed_consent integer DEFAULT 0,
    execution_log jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.journey_nodes (
    node_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id uuid REFERENCES public.marketing_journeys(journey_id) ON DELETE CASCADE,
    instance_id text NOT NULL,
    node_type text NOT NULL,
    node_label text NOT NULL,
    node_action text,
    position_x numeric,
    position_y numeric,
    config jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.marketing_consent (
    consent_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    email text,
    email_marketing boolean DEFAULT true,
    sms_marketing boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    remarketing boolean DEFAULT true,
    third_party_share boolean DEFAULT false,
    do_not_contact boolean DEFAULT false,
    gdpr_opted_out boolean DEFAULT false,
    tcpa_restricted boolean DEFAULT false,
    consent_updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_fatigue_log (
    fatigue_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES public.marketing_journeys(journey_id) ON DELETE CASCADE,
    channel text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    suppressed boolean DEFAULT false
);


-- RLS ENABLING (Simple Allow-All for Demo)
ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.onboarding_applications FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.onboarding_edd_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.onboarding_edd_records FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.onboarding_documents FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.onboarding_kyc_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.onboarding_kyc_checks FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.credit_bureau_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.credit_bureau_reports FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.credit_financial_spreads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.credit_financial_spreads FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.credit_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.credit_offers FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.credit_policy_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.credit_policy_results FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.credit_adverse_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.credit_adverse_actions FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.case_complaint_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.case_complaint_details FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.case_sla_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.case_sla_events FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.compliance_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.compliance_profiles FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.compliance_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.compliance_resolutions FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.rm_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.rm_alerts FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.sanctions_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.sanctions_logs FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.knowledge_articles FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.knowledge_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.knowledge_feedback FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.marketing_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.marketing_journeys FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.journey_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.journey_executions FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.journey_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.journey_nodes FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.marketing_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.marketing_consent FOR ALL TO public USING (true) WITH CHECK (true);
ALTER TABLE public.marketing_fatigue_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON public.marketing_fatigue_log FOR ALL TO public USING (true) WITH CHECK (true);

