-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Parties (Individual & Corporate)
create table if not exists parties (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('individual', 'corporate')),
  legal_name text not null,
  display_name text,
  email text,
  phone text,
  address jsonb,
  attributes jsonb default '{}'::jsonb, -- Stores DOB, SSN, LEI, NAICS, etc.
  created_at timestamptz default now()
);

-- 2. Relationships (Households, Groups)
create table if not exists relationships (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('household', 'subsidiary', 'group')),
  primary_party_id uuid references parties(id),
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 3. Party <=> Relationship Mapping
create table if not exists party_relationships (
  id uuid primary key default uuid_generate_v4(),
  relationship_id uuid references relationships(id) on delete cascade,
  party_id uuid references parties(id) on delete cascade,
  role text, -- 'member', 'owner', 'subsidiary'
  created_at timestamptz default now()
);

-- 4. Financial Products (Holdings)
create table if not exists financial_products (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid references parties(id) on delete cascade,
  category text not null, -- 'checking', 'savings', 'loan', 'investment'
  product_name text not null,
  balance numeric default 0,
  currency text default 'USD',
  status text default 'active',
  limit_amount numeric,
  opened_at timestamptz default now(),
  attributes jsonb default '{}'::jsonb
);

-- 5. Compliance (KYC, AML)
create table if not exists compliance (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid references parties(id) on delete cascade,
  kyc_status text default 'pending', -- 'verified', 'pending', 'rejected'
  aml_risk_rating text default 'low', -- 'low', 'medium', 'high'
  sanctions_hits boolean default false,
  last_review_date timestamptz,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table parties enable row level security;
alter table relationships enable row level security;
alter table party_relationships enable row level security;
alter table financial_products enable row level security;
alter table compliance enable row level security;

-- Create policies (Allow Public Read/Write for Demo/RM usage)
-- In a real app, this would be restricted to authenticated RMs.
-- For now, we allow anon access to facilitate the demo and mock data generation.
create policy "Enable all access for all users" on parties for all using (true) with check (true);
create policy "Enable all access for all users" on relationships for all using (true) with check (true);
create policy "Enable all access for all users" on party_relationships for all using (true) with check (true);
create policy "Enable all access for all users" on financial_products for all using (true) with check (true);
create policy "Enable all access for all users" on compliance for all using (true) with check (true);

-- Create indexes
create index if not exists parties_type_idx on parties(type);
create index if not exists financial_products_party_id_idx on financial_products(party_id);
create index if not exists party_relationships_relationship_id_idx on party_relationships(relationship_id);
-- 1. Extend Parties Table
ALTER TABLE parties 
ADD COLUMN IF NOT EXISTS segment text;

-- 2. Extend Sales Opportunities Table
ALTER TABLE sales_opportunities
ADD COLUMN IF NOT EXISTS opportunity_name text,
ADD COLUMN IF NOT EXISTS primary_contact_id uuid REFERENCES individual_parties(customer_id),
ADD COLUMN IF NOT EXISTS lead_id uuid, -- Reference to leads table created below
ADD COLUMN IF NOT EXISTS owner text,
ADD COLUMN IF NOT EXISTS closed_at timestamptz,
ADD COLUMN IF NOT EXISTS loss_reason text;

-- 3. Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
    lead_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id uuid NOT NULL REFERENCES parties(party_id) ON DELETE CASCADE,
    contact_id uuid REFERENCES individual_parties(customer_id),
    lead_source text, -- Website, Referral, Campaign
    status text CHECK (status IN ('New', 'Working', 'Qualified', 'Disqualified')),
    rating text CHECK (rating IN ('Hot', 'Warm', 'Cold')),
    owner text,
    created_at timestamptz DEFAULT now(),
    qualified_at timestamptz,
    disqualification_reason text,
    updated_at timestamptz DEFAULT now()
);

-- 4. Create Activities Table
CREATE TABLE IF NOT EXISTS activities (
    activity_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_lead_id uuid REFERENCES leads(lead_id) ON DELETE CASCADE,
    related_opportunity_id uuid REFERENCES sales_opportunities(opportunity_id) ON DELETE CASCADE,
    activity_type text CHECK (activity_type IN ('Call', 'Email', 'Meeting', 'Task')),
    subject text NOT NULL,
    due_date timestamptz,
    completed boolean DEFAULT false,
    notes text,
    owner text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Add RLS Policies for New Tables
-- (Assuming RLS is enabled on new tables by default or needs to be enabled)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON activities FOR ALL USING (true) WITH CHECK (true);

-- 6. Add Indexes
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(related_lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_opp ON activities(related_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_due ON activities(due_date);
-- Drop existing tables to ensure a clean slate
drop table if exists compliance cascade;
drop table if exists financial_products cascade;
drop table if exists party_relationships cascade;
drop table if exists relationships cascade;
drop table if exists parties cascade;
drop table if exists individual_parties cascade;
drop table if exists corporate_parties cascade;
drop table if exists sales_opportunities cascade;
drop table if exists compliance_registry cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 0. Master Parties Table (Polymorphic Anchor)
-- This allows Financial Products & Compliance to reference a single "customer_id"
-- regardless of whether it's an Individual or Corporate entity.
create table parties (
  party_id uuid primary key default uuid_generate_v4(),
  party_type text not null check (party_type in ('individual', 'corporate')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1. Individual Parties (Extends Parties)
create table individual_parties (
  customer_id uuid primary key references parties(party_id) on delete cascade,
  full_legal_name text not null,
  dob date,
  ssn_hash text,
  nationality text,
  employment_status text,
  annual_income numeric,
  segment_tier text check (segment_tier in ('Standard', 'Silver', 'Gold', 'Platinum', 'UHNW')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Corporate Parties (Extends Parties)
create table corporate_parties (
  entity_id uuid primary key references parties(party_id) on delete cascade,
  legal_name text not null,
  dba text, -- Doing Business As
  lei text, -- Legal Entity Identifier
  naics_code text,
  incorporation_date date,
  annual_revenue numeric,
  ultimate_parent_id uuid references corporate_parties(entity_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Financial Products
create table financial_products (
  account_id uuid primary key default uuid_generate_v4(),
  customer_id uuid references parties(party_id) on delete cascade, -- References Master Table
  product_type text not null check (product_type in ('Checking', 'Savings', 'Mortgage', 'Credit Card', 'Investment')),
  current_balance numeric default 0,
  available_balance numeric default 0,
  currency_code text default 'USD',
  account_status text default 'active' check (account_status in ('active', 'dormant', 'closed', 'frozen')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Compliance Registry
create table compliance_registry (
  compliance_id uuid primary key default uuid_generate_v4(),
  customer_id uuid references parties(party_id) on delete cascade,
  kyc_refresh_due_date date,
  aml_risk_rating text check (aml_risk_rating in ('Low', 'Medium', 'High')),
  pep_status_flag boolean default false, -- Politically Exposed Person
  fatca_classification text,
  crs_tax_residency text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Sales Opportunities
create table sales_opportunities (
  opportunity_id uuid primary key default uuid_generate_v4(),
  customer_id uuid references parties(party_id) on delete cascade,
  opportunity_stage text check (opportunity_stage in ('Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed-Won', 'Closed-Lost')),
  projected_value numeric,
  probability_weighting int check (probability_weighting between 0 and 100),
  expected_close_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS)
-- Enabling RLS on all tables and providing public access for the Demo environment.

alter table parties enable row level security;
alter table individual_parties enable row level security;
alter table corporate_parties enable row level security;
alter table financial_products enable row level security;
alter table compliance_registry enable row level security;
alter table sales_opportunities enable row level security;

create policy "Enable all access for all users" on parties for all using (true) with check (true);
create policy "Enable all access for all users" on individual_parties for all using (true) with check (true);
create policy "Enable all access for all users" on corporate_parties for all using (true) with check (true);
create policy "Enable all access for all users" on financial_products for all using (true) with check (true);
create policy "Enable all access for all users" on compliance_registry for all using (true) with check (true);
create policy "Enable all access for all users" on sales_opportunities for all using (true) with check (true);

-- Indexes for performance
create index idx_parties_type on parties(party_type);
create index idx_financial_products_customer on financial_products(customer_id);
create index idx_financial_products_type on financial_products(product_type);
create index idx_opportunities_customer on sales_opportunities(customer_id);
create index idx_opportunities_stage on sales_opportunities(opportunity_stage);
create index idx_corporate_parent on corporate_parties(ultimate_parent_id);
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
CREATE TABLE IF NOT EXISTS public.credit_bureau_reports (
    report_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(application_id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_bureau_app ON public.credit_bureau_reports (application_id);

ALTER TABLE public.credit_bureau_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_bureau" ON public.credit_bureau_reports FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.credit_financial_spreads (
    spread_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL UNIQUE REFERENCES public.credit_applications(application_id) ON DELETE CASCADE,
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

ALTER TABLE public.credit_financial_spreads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_spreads" ON public.credit_financial_spreads FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.credit_offers (
    offer_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(application_id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES public.sales_opportunities(opportunity_id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_offers_app ON public.credit_offers (application_id);
CREATE INDEX IF NOT EXISTS idx_offers_opp ON public.credit_offers (opportunity_id);

ALTER TABLE public.credit_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_offers" ON public.credit_offers FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.credit_policy_results (
    result_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(application_id) ON DELETE CASCADE,
    rule_id text NOT NULL,
    rule_type text NOT NULL,
    triggered boolean DEFAULT false,
    decline_code text,
    required_action text,
    exception_doc text,
    evaluated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_policy_app ON public.credit_policy_results (application_id);

ALTER TABLE public.credit_policy_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_policy" ON public.credit_policy_results FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.credit_adverse_actions (
    action_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES public.credit_applications(application_id) ON DELETE CASCADE,
    decline_codes text[] NOT NULL,
    reason_text text NOT NULL,
    bureau_disclosure text,
    ecoa_notice text,
    generated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_adverse_app ON public.credit_adverse_actions (application_id);

ALTER TABLE public.credit_adverse_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_adverse" ON public.credit_adverse_actions FOR ALL TO public USING (true) WITH CHECK (true);
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

ALTER TABLE public.marketing_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_journeys" ON public.marketing_journeys FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.journey_executions (
    execution_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id uuid REFERENCES public.marketing_journeys(journey_id),
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
CREATE INDEX IF NOT EXISTS idx_jexec_journey ON public.journey_executions (journey_id);

ALTER TABLE public.journey_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_jexec" ON public.journey_executions FOR ALL TO public USING (true) WITH CHECK (true);


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
CREATE INDEX IF NOT EXISTS idx_jnodes_journey ON public.journey_nodes (journey_id);

ALTER TABLE public.journey_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_jnodes" ON public.journey_nodes FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.marketing_consent (
    consent_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid,
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
CREATE INDEX IF NOT EXISTS idx_consent_party ON public.marketing_consent (party_id);

ALTER TABLE public.marketing_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_consent" ON public.marketing_consent FOR ALL TO public USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.marketing_fatigue_log (
    fatigue_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id uuid,
    campaign_id uuid REFERENCES public.marketing_journeys(journey_id),
    channel text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    suppressed boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_fatigue_date ON public.marketing_fatigue_log (sent_at);
CREATE INDEX IF NOT EXISTS idx_fatigue_party_channel ON public.marketing_fatigue_log (party_id, channel, sent_at);

ALTER TABLE public.marketing_fatigue_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_fatigue" ON public.marketing_fatigue_log FOR ALL TO public USING (true) WITH CHECK (true);
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

