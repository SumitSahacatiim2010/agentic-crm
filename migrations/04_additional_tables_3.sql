CREATE TABLE IF NOT EXISTS public.audit_logs (
    event_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_name character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    changes jsonb,
    actor_id uuid,
    actor_persona character varying(50),
    event_time timestamp with time zone DEFAULT now(),
    regulatory_domain text,
    action_class text,
    reason text
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write audit" ON public.audit_logs FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.case_complaint_details (
    complaint_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.service_cases(case_id) ON DELETE CASCADE,
    complaint_type character varying(100) NOT NULL,
    financial_impact numeric,
    regulatory_reportable boolean DEFAULT false,
    root_cause text,
    compensation_offered numeric,
    ombudsman_referred boolean DEFAULT false
);

ALTER TABLE public.case_complaint_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write ccd" ON public.case_complaint_details FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.case_sla_events (
    event_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.service_cases(case_id) ON DELETE CASCADE,
    event_type character varying(50) NOT NULL,
    event_timestamp timestamp with time zone DEFAULT now(),
    old_status character varying(50),
    new_status character varying(50),
    sla_breached boolean DEFAULT false
);

ALTER TABLE public.case_sla_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write sla" ON public.case_sla_events FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.compliance_profiles (
    compliance_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid UNIQUE REFERENCES public.parties(party_id),
    kyc_status character varying(50) DEFAULT 'pending',
    kyc_last_review timestamp with time zone,
    kyc_next_review timestamp with time zone,
    aml_risk_rating character varying(50) DEFAULT 'low',
    fatca_crs_status character varying(50),
    pep_status boolean DEFAULT false
);

ALTER TABLE public.compliance_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write for compl" ON public.compliance_profiles FOR ALL TO public USING (true) WITH CHECK (true);


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

ALTER TABLE public.compliance_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_resolutions" ON public.compliance_resolutions FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.interactions (
    interaction_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.parties(party_id),
    interaction_type character varying(50),
    direction character varying(20),
    channel character varying(50),
    interaction_date timestamp with time zone DEFAULT now(),
    summary text,
    notes text,
    sentiment_score integer,
    created_by character varying(100),
    activity_id uuid
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write inter" ON public.interactions FOR ALL TO public USING (true) WITH CHECK (true);


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

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write kw" ON public.knowledge_articles FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.knowledge_feedback (
    feedback_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id uuid NOT NULL REFERENCES public.knowledge_articles(article_id) ON DELETE CASCADE,
    user_id uuid,
    is_helpful boolean NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.knowledge_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write fb" ON public.knowledge_feedback FOR ALL TO public USING (true) WITH CHECK (true);


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

ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write onb_doc" ON public.onboarding_documents FOR ALL TO public USING (true) WITH CHECK (true);


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

ALTER TABLE public.onboarding_kyc_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write onb_kyc" ON public.onboarding_kyc_checks FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.rm_alerts (
    alert_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.parties(party_id),
    alert_type character varying(50) NOT NULL,
    message text NOT NULL,
    priority character varying(20) DEFAULT 'medium',
    status character varying(20) DEFAULT 'unread',
    created_at timestamp with time zone DEFAULT now(),
    action_url text
);

ALTER TABLE public.rm_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write rma" ON public.rm_alerts FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.sanctions_logs (
    log_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid REFERENCES public.parties(party_id),
    screened_at timestamp with time zone DEFAULT now(),
    status character varying(50),
    match_details jsonb
);

ALTER TABLE public.sanctions_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow pub write sanc" ON public.sanctions_logs FOR ALL TO public USING (true) WITH CHECK (true);
