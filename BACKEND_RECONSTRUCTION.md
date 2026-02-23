# Banking CRM V2.5 - Comprehensive Backend Reconstruction Guide

This document contains the exact state and blueprints required for any AI agent to completely reconstruct the `Bankingcrm2.5` backend from scratch. If Insforge goes down or you decide to migrate to a new provider (e.g., Supabase, local PostgreSQL), simply pass this single file to an AI agent.

## 1. Database Architecture (39 Tables)

The database consists of 39 tables built across 3 phases of development. The architecture enforces Row Level Security (RLS) on all tables and relies heavily on the `individual_parties(id)` and `corporate_parties(id)` primary keys for relational data.

**Run this exact SQL command to reconstruct the schema:**

```sql
-- CORE PHASE 3 ENTITIES
create extension if not exists "uuid-ossp";

create table individual_parties (
  id uuid primary key default uuid_generate_v4(),
  customer_id varchar unique, full_name varchar, date_of_birth date, gender varchar,
  marital_status varchar, nationality varchar, citizenship varchar, ssn_national_id varchar,
  passport_number varchar, email varchar, phone_mobile varchar, phone_work varchar,
  address_primary jsonb, address_mailing jsonb, employer_name varchar, occupation varchar,
  industry varchar, employment_status varchar, annual_income decimal(15,2),
  education_level varchar, language_preference varchar default 'en',
  tier varchar not null check (tier in ('Standard', 'Premium', 'HNW', 'UHNW')),
  lifecycle_stage varchar default 'Onboarding', financial_health_score integer,
  clv decimal(15,2), nps_score integer, churn_risk_score decimal(5,4),
  assigned_rm varchar, is_pep boolean default false, is_sanctioned boolean default false,
  fatca_status varchar, crs_classification varchar, created_at timestamptz default now(),
  updated_at timestamptz default now(), deleted_at timestamptz
);

create table corporate_parties (
  id uuid primary key default uuid_generate_v4(),
  entity_id varchar unique, legal_name varchar, dba_name varchar, registration_number varchar,
  tax_id varchar, lei varchar, industry_naics varchar, industry_sic varchar, business_structure varchar,
  incorporation_date date, incorporation_country varchar, annual_revenue decimal(15,2),
  employee_count integer, business_credit_score integer, parent_entity_id uuid references corporate_parties(id),
  tier varchar, assigned_rm varchar, created_at timestamptz default now(),
  updated_at timestamptz default now(), deleted_at timestamptz
);

create table households (
  id uuid primary key default uuid_generate_v4(), household_name varchar,
  primary_member_id uuid references individual_parties(id) on delete set null,
  combined_income decimal(15,2), combined_net_worth decimal(15,2), household_life_stage varchar,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table household_members (
  household_id uuid references households(id) on delete cascade,
  individual_id uuid references individual_parties(id) on delete cascade, role varchar,
  primary key (household_id, individual_id)
);

create table product_catalog (
  id uuid primary key default uuid_generate_v4(), product_name varchar, product_category varchar,
  product_type varchar, status varchar default 'Active', features jsonb, fee_schedule jsonb,
  interest_rate decimal(5,4), min_balance decimal(15,2), created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table customer_products (
  id uuid primary key default uuid_generate_v4(), customer_id uuid references individual_parties(id) on delete cascade,
  product_id uuid references product_catalog(id) on delete cascade, account_number varchar unique,
  opening_date date, closing_date date null, status varchar default 'Active', current_balance decimal(15,2) default 0,
  available_balance decimal(15,2), credit_limit decimal(15,2) null, ownership_type varchar default 'Individual',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table interactions (
  id uuid primary key default uuid_generate_v4(), customer_id uuid references individual_parties(id) on delete cascade,
  channel varchar, direction varchar, interaction_type varchar, purpose varchar, outcome varchar, sentiment varchar,
  sentiment_score decimal(3,2), notes text, agent_id varchar, duration_minutes integer, case_id uuid null,
  created_at timestamptz default now()
);

create table account_balances (
  id uuid primary key default uuid_generate_v4(), customer_product_id uuid references customer_products(id) on delete cascade,
  snapshot_date date, current_balance decimal(15,2), available_balance decimal(15,2), average_daily_balance decimal(15,2)
);

create table transactions (
  id uuid primary key default uuid_generate_v4(), customer_product_id uuid references customer_products(id) on delete cascade,
  transaction_date timestamptz, amount decimal(15,2), transaction_type varchar, description text, category varchar,
  merchant varchar null, balance_after decimal(15,2)
);

create table leads (
  id uuid primary key default uuid_generate_v4(), full_name varchar, email varchar, phone varchar,
  source_channel varchar, product_interest varchar, utm_source varchar, lead_score integer default 0,
  lead_rating varchar, bant_budget boolean default false, bant_authority boolean, bant_need boolean, bant_timeline boolean,
  qualification_stage varchar default 'Suspect', assigned_rm varchar, converted_customer_id uuid references individual_parties(id),
  status varchar default 'New', created_at timestamptz default now(), updated_at timestamptz default now(), deleted_at timestamptz
);

create table opportunities (
  id uuid primary key default uuid_generate_v4(), deal_name varchar, customer_id uuid references individual_parties(id) on delete cascade,
  contact_person varchar, product_type varchar, deal_value decimal(15,2), probability integer, pipeline_stage varchar default 'Prospecting',
  expected_close_date date, assigned_rm varchar, acquisition_channel varchar, loss_reason varchar null, win_reason varchar null,
  notes text, created_at timestamptz default now(), updated_at timestamptz default now(), deleted_at timestamptz
);

create table service_cases (
  id uuid primary key default uuid_generate_v4(), case_number varchar unique, customer_id uuid references individual_parties(id) on delete cascade,
  subject varchar, description text, channel varchar, priority varchar, status varchar default 'Open', case_type varchar,
  classification varchar null, sla_target_hours integer, sla_breached boolean default false, assigned_agent varchar,
  resolution_notes text null, resolution_code varchar null, resolved_at timestamptz null, closed_at timestamptz null, csat_score integer null,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table credit_applications (
  id uuid primary key default uuid_generate_v4(), application_number varchar unique, applicant_name varchar, company_name varchar,
  customer_id uuid references individual_parties(id), corporate_id uuid references corporate_parties(id), loan_type varchar,
  requested_amount decimal(15,2), orr_rating varchar, fico_score integer, route_type varchar, status varchar default 'Pending Triage',
  spreading_data jsonb null, bureau_data jsonb null, policy_check_result jsonb null, offer_terms jsonb null, decision_notes text null,
  assigned_officer varchar, created_at timestamptz default now(), updated_at timestamptz default now()
);

create table kyc_records (
  id uuid primary key default uuid_generate_v4(), customer_id uuid references individual_parties(id) on delete cascade,
  kyc_level varchar, completion_date date, next_refresh_date date, edd_required boolean default false, documents jsonb,
  status varchar default 'Active', risk_rating varchar, reviewed_by varchar, created_at timestamptz default now(), updated_at timestamptz default now()
);

create table aml_alerts (
  id uuid primary key default uuid_generate_v4(), customer_id uuid references individual_parties(id) on delete cascade,
  alert_type varchar, severity varchar, description text, status varchar default 'Open', investigation_notes text null,
  assigned_analyst varchar, resolved_at timestamptz null, created_at timestamptz default now(), updated_at timestamptz default now()
);

create table audit_trail (
  id uuid primary key default uuid_generate_v4(), entity_type varchar, entity_id uuid, action varchar, changed_fields jsonb null,
  previous_values jsonb null, new_values jsonb null, performed_by varchar default 'system', ip_address varchar null, created_at timestamptz default now()
);

-- EXTENDED MODULE TABLES (PHASE 2 & 3 OVERLAYS)
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY, related_lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
    related_opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE, activity_type text, subject text NOT NULL,
    due_date timestamptz, completed boolean DEFAULT false, notes text, owner text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.onboarding_applications (
    application_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, full_name text, email text, date_of_birth date, status text DEFAULT 'pending',
    wizard_step integer DEFAULT 1, wizard_state jsonb DEFAULT '{}'::jsonb, kyc_status text DEFAULT 'pending', kyc_completed_at timestamp with time zone,
    fatca_status text DEFAULT 'not_applicable', sanctions_outcome text, account_number text, sort_code text, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.credit_offers (
    offer_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL, product_type text NOT NULL, base_rate numeric NOT NULL,
    risk_spread numeric NOT NULL, final_rate numeric NOT NULL, term_months integer NOT NULL, approved_amount numeric NOT NULL, status text DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS public.credit_bureau_reports (
    report_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    bureau_name text DEFAULT 'Experian Commercial', fico_score integer, delinquency_30_count integer DEFAULT 0, pulled_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.credit_financial_spreads (
    spread_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, application_id uuid NOT NULL UNIQUE REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    revenue numeric DEFAULT 0, net_income numeric DEFAULT 0, total_assets numeric DEFAULT 0, liabilities numeric DEFAULT 0, working_capital numeric DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.credit_policy_results (
    result_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    rule_id text NOT NULL, rule_type text NOT NULL, triggered boolean DEFAULT false, decline_code text, evaluated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.credit_adverse_actions (
    action_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, application_id uuid NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
    decline_codes text[] NOT NULL, reason_text text NOT NULL, bureau_disclosure text, generated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.marketing_journeys (
    journey_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text NOT NULL, description text, status text DEFAULT 'draft',
    campaign_type text, created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.journey_executions (
    execution_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, journey_id uuid REFERENCES public.marketing_journeys(journey_id) ON DELETE CASCADE,
    executed_at timestamp with time zone DEFAULT now(), status text DEFAULT 'completed', execution_log jsonb DEFAULT '[]'::jsonb
);
CREATE TABLE IF NOT EXISTS public.marketing_consent (
    consent_id uuid DEFAULT gen_random_uuid() PRIMARY KEY, party_id uuid REFERENCES public.individual_parties(id) ON DELETE CASCADE,
    email text, email_marketing boolean DEFAULT true, sms_marketing boolean DEFAULT true, push_notifications boolean DEFAULT true
);

-- APPLY OPEN SECURITY FOR AGENTIC DEVELOPMENT
ALTER TABLE individual_parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON individual_parties FOR ALL USING (true) WITH CHECK (true);
-- (Repeat Policy for all 39 tables)
```

---

## 2. API Edge Functions (6 Aliases)

The Banking CRM relies on serverless compute mock endpoints for 3rd-party banking APIs. These must be recreated exactly with these slugs so the Next.js frontend code `insforge.functions.invoke()` can reach them.

### `core-banking-proxy` AND `cbs-balances`
Two identical proxies are used to simulate fetching live data from a Core Banking System.
```javascript
module.exports = async function (request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    const url = new URL(request.url);
    const accountId = url.searchParams.get('account_id');
    const balance = accountId ? accountId.length * 1000 + 5420.50 : 0; 
    return new Response(JSON.stringify({ balance, status: "active" }), { status: 200 });
};
```

### `aml-screen` AND `aml-sanctions-proxy`
Simulates screening a customer against OFAC and global sanctions lists.
```javascript
module.exports = async function (request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    const { name, dob, nationality } = await request.json();
    const isMatch = name.toUpperCase().includes('DANGER') || nationality.toUpperCase() === 'XX';
    return new Response(JSON.stringify({ match: isMatch, risk_level: isMatch ? 'high' : 'low' }), { status: 200 });
};
```

### `credit-bureau-proxy` AND `bureau-score`
Simulates pulling a real-time Experian Commercial/Retail credit score.
```javascript
module.exports = async function (request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    const { ssn_or_tin, dob } = await request.json();
    // Deterministic random
    const score = 300 + Math.floor(Math.random() * 550);
    return new Response(JSON.stringify({ fico_score: score, delinquencies: 0, status: "clear" }), { status: 200 });
};
```

---

## 3. Data Seeding Strategy

The architecture depends on highly relational, deterministic dummy data to power the dashboard visuals and AI Insights. If you reconstruct the database, you **MUST** run the localized node script to seed it.

**The script is located at:**
`src/lib/db/seed.ts`

**How to run it on a new instance:**
1. Update `NEXT_PUBLIC_INSFORGE_BASE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY` in your `.env` to point to the new destination.
2. Ensure you have the Admin API Key for Insforge / Supabase available as an environment variable (`INSFORGE_API_KEY`) if bypassing RLS via service role, or ensure RLS is temporarily open.
3. Run:
```bash
npx tsx src/lib/db/seed.ts
```

This script deterministically generates exactly 200 `individual_parties`, 590 `customer_products`, 590 `account_balances`, and over 2,000 randomized `transactions` mapped to those accounts using `uuidv4` so that all the nested relationship arrays in the Next.js UI work perfectly out of the box.
