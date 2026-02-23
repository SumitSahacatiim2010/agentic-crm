-- Clean Slate: Drop all potential existing tables from Phase 2 / Phase 0
drop table if exists parties cascade;
drop table if exists individual_parties cascade;
drop table if exists corporate_parties cascade;
drop table if exists party_relationships cascade;
drop table if exists households cascade;
drop table if exists household_members cascade;
drop table if exists financial_products cascade;
drop table if exists compliance_registry cascade;
drop table if exists sales_opportunities cascade;
drop table if exists leads cascade;
drop table if exists opportunities cascade;
drop table if exists activities cascade;
drop table if exists service_cases cascade;
drop table if exists onboarding_applications cascade;
drop table if exists onboarding_documents cascade;
drop table if exists onboarding_kyc_checks cascade;
drop table if exists credit_applications cascade;
drop table if exists credit_bureau_reports cascade;
drop table if exists credit_financial_spreads cascade;
drop table if exists credit_offers cascade;
drop table if exists credit_policy_results cascade;
drop table if exists credit_adverse_actions cascade;
drop table if exists case_complaint_details cascade;
drop table if exists case_sla_events cascade;
drop table if exists compliance_profiles cascade;
drop table if exists compliance_resolutions cascade;
drop table if exists interactions cascade;
drop table if exists knowledge_articles cascade;
drop table if exists audit_logs cascade;
drop table if exists audit_trail cascade;
drop table if exists marketing_journeys cascade;
drop table if exists journey_nodes cascade;
drop table if exists journey_executions cascade;
drop table if exists marketing_consent cascade;
drop table if exists marketing_fatigue_log cascade;
drop table if exists product_catalog cascade;
drop table if exists customer_products cascade;
drop table if exists account_balances cascade;
drop table if exists transactions cascade;
drop table if exists kyc_records cascade;
drop table if exists aml_alerts cascade;

create extension if not exists "uuid-ossp";

-- 1. individual_parties — Full customer master
create table individual_parties (
  id uuid primary key default uuid_generate_v4(),
  customer_id varchar unique,
  full_name varchar,
  date_of_birth date,
  gender varchar,
  marital_status varchar,
  nationality varchar,
  citizenship varchar,
  ssn_national_id varchar,
  passport_number varchar,
  email varchar,
  phone_mobile varchar,
  phone_work varchar,
  address_primary jsonb,
  address_mailing jsonb,
  employer_name varchar,
  occupation varchar,
  industry varchar,
  employment_status varchar check (employment_status in ('Employed', 'Self-Employed', 'Retired', 'Student')),
  annual_income decimal(15,2),
  education_level varchar,
  language_preference varchar default 'en',
  tier varchar not null check (tier in ('Standard', 'Premium', 'HNW', 'UHNW')),
  lifecycle_stage varchar default 'Onboarding' check (lifecycle_stage in ('Prospect', 'Onboarding', 'Growth', 'Maturity', 'At-Risk', 'Dormant', 'Churned')),
  financial_health_score integer check (financial_health_score >= 0 and financial_health_score <= 100),
  clv decimal(15,2),
  nps_score integer,
  churn_risk_score decimal(5,4),
  assigned_rm varchar,
  is_pep boolean default false,
  is_sanctioned boolean default false,
  fatca_status varchar,
  crs_classification varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 2. corporate_parties
create table corporate_parties (
  id uuid primary key default uuid_generate_v4(),
  entity_id varchar unique,
  legal_name varchar,
  dba_name varchar,
  registration_number varchar,
  tax_id varchar,
  lei varchar,
  industry_naics varchar,
  industry_sic varchar,
  business_structure varchar check (business_structure in ('LLC', 'Corp', 'Partnership', 'Sole')),
  incorporation_date date,
  incorporation_country varchar,
  annual_revenue decimal(15,2),
  employee_count integer,
  business_credit_score integer,
  parent_entity_id uuid references corporate_parties(id) on delete set null,
  tier varchar,
  assigned_rm varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 3. households
create table households (
  id uuid primary key default uuid_generate_v4(),
  household_name varchar,
  primary_member_id uuid references individual_parties(id) on delete set null,
  combined_income decimal(15,2),
  combined_net_worth decimal(15,2),
  household_life_stage varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. household_members (junction)
create table household_members (
  household_id uuid references households(id) on delete cascade,
  individual_id uuid references individual_parties(id) on delete cascade,
  role varchar check (role in ('Head', 'Co-Head', 'Dependent', 'Authorized User')),
  primary key (household_id, individual_id)
);

-- 5. product_catalog
create table product_catalog (
  id uuid primary key default uuid_generate_v4(),
  product_name varchar,
  product_category varchar check (product_category in ('Deposits', 'Loans', 'Investments', 'Cards', 'Insurance')),
  product_type varchar,
  status varchar default 'Active',
  features jsonb,
  fee_schedule jsonb,
  interest_rate decimal(5,4),
  min_balance decimal(15,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. customer_products
create table customer_products (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references individual_parties(id) on delete cascade,
  product_id uuid references product_catalog(id) on delete cascade,
  account_number varchar unique,
  opening_date date,
  closing_date date null,
  status varchar default 'Active' check (status in ('Active', 'Dormant', 'Closed')),
  current_balance decimal(15,2) default 0,
  available_balance decimal(15,2),
  credit_limit decimal(15,2) null,
  ownership_type varchar default 'Individual' check (ownership_type in ('Individual', 'Joint')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. interactions
create table interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references individual_parties(id) on delete cascade,
  channel varchar check (channel in ('Branch', 'Phone', 'Web', 'Mobile', 'Chatbot', 'Email', 'SMS')),
  direction varchar check (direction in ('Inbound', 'Outbound')),
  interaction_type varchar check (interaction_type in ('Meeting', 'Call', 'Transaction', 'Digital', 'Service')),
  purpose varchar,
  outcome varchar,
  sentiment varchar check (sentiment in ('Positive', 'Neutral', 'Negative')),
  sentiment_score decimal(3,2),
  notes text,
  agent_id varchar,
  duration_minutes integer,
  case_id uuid null,
  created_at timestamptz default now()
);

-- 8. account_balances
create table account_balances (
  id uuid primary key default uuid_generate_v4(),
  customer_product_id uuid references customer_products(id) on delete cascade,
  snapshot_date date,
  current_balance decimal(15,2),
  available_balance decimal(15,2),
  average_daily_balance decimal(15,2)
);

-- 9. transactions
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  customer_product_id uuid references customer_products(id) on delete cascade,
  transaction_date timestamptz,
  amount decimal(15,2),
  transaction_type varchar check (transaction_type in ('Debit', 'Credit')),
  description text,
  category varchar,
  merchant varchar null,
  balance_after decimal(15,2)
);

-- 10. leads
create table leads (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar,
  email varchar,
  phone varchar,
  source_channel varchar check (source_channel in ('Web', 'Branch', 'Marketing', 'Partner')),
  product_interest varchar,
  utm_source varchar,
  lead_score integer default 0,
  lead_rating varchar check (lead_rating in ('Hot', 'Warm', 'Cold')),
  bant_budget boolean default false,
  bant_authority boolean,
  bant_need boolean,
  bant_timeline boolean,
  qualification_stage varchar default 'Suspect' check (qualification_stage in ('Suspect', 'Prospect', 'Qualified', 'Sales-Accepted', 'Opportunity')),
  assigned_rm varchar,
  converted_customer_id uuid references individual_parties(id) on delete set null null,
  status varchar default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Converted', 'Disqualified')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 11. opportunities
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  deal_name varchar,
  customer_id uuid references individual_parties(id) on delete cascade,
  contact_person varchar,
  product_type varchar,
  deal_value decimal(15,2),
  probability integer check (probability >= 0 and probability <= 100),
  pipeline_stage varchar default 'Prospecting' check (pipeline_stage in ('Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Completed', 'Closed-Lost')),
  expected_close_date date,
  assigned_rm varchar,
  acquisition_channel varchar,
  loss_reason varchar null,
  win_reason varchar null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 12. service_cases
create table service_cases (
  id uuid primary key default uuid_generate_v4(),
  case_number varchar unique,
  customer_id uuid references individual_parties(id) on delete cascade,
  subject varchar,
  description text,
  channel varchar check (channel in ('Phone', 'Branch', 'Web', 'Chatbot', 'Email', 'Mobile')),
  priority varchar check (priority in ('P1-Critical', 'P2-High', 'P3-Medium', 'P4-Low')),
  status varchar default 'Open' check (status in ('Open', 'In Progress', 'Escalated', 'Resolved', 'Closed')),
  case_type varchar check (case_type in ('Service Request', 'Inquiry', 'Complaint', 'Technical')),
  classification varchar null check (classification in ('Standard Inquiry', 'Formal Complaint') or classification is null),
  sla_target_hours integer,
  sla_breached boolean default false,
  assigned_agent varchar,
  resolution_notes text null,
  resolution_code varchar null,
  resolved_at timestamptz null,
  closed_at timestamptz null,
  csat_score integer null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. credit_applications
create table credit_applications (
  id uuid primary key default uuid_generate_v4(),
  application_number varchar unique,
  applicant_name varchar,
  company_name varchar,
  customer_id uuid references individual_parties(id) on delete set null null,
  corporate_id uuid references corporate_parties(id) on delete set null null,
  loan_type varchar check (loan_type in ('Term Loan', 'Line of Credit', 'Mortgage', 'Auto', 'Personal')),
  requested_amount decimal(15,2),
  orr_rating varchar check (orr_rating in ('ORR-1', 'ORR-2', 'ORR-3', 'ORR-4', 'ORR-5', 'ORR-6', 'ORR-7', 'ORR-8', 'ORR-9', 'ORR-10')),
  fico_score integer,
  route_type varchar check (route_type in ('STP', 'Standard', 'Specialist')),
  status varchar default 'Pending Triage' check (status in ('Pending Triage', 'Underwriting', 'Approved', 'Declined', 'Booked')),
  spreading_data jsonb null,
  bureau_data jsonb null,
  policy_check_result jsonb null,
  offer_terms jsonb null,
  decision_notes text null,
  assigned_officer varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. kyc_records
create table kyc_records (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references individual_parties(id) on delete cascade,
  kyc_level varchar check (kyc_level in ('Standard', 'Simplified', 'Enhanced')),
  completion_date date,
  next_refresh_date date,
  edd_required boolean default false,
  documents jsonb,
  status varchar default 'Active' check (status in ('Active', 'Pending Refresh', 'Expired')),
  risk_rating varchar check (risk_rating in ('Low', 'Medium', 'High')),
  reviewed_by varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. aml_alerts
create table aml_alerts (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references individual_parties(id) on delete cascade,
  alert_type varchar check (alert_type in ('Transaction Monitoring', 'Sanctions Hit', 'Adverse Media')),
  severity varchar check (severity in ('Low', 'Medium', 'High', 'Critical')),
  description text,
  status varchar default 'Open' check (status in ('Open', 'Under Investigation', 'Escalated', 'Closed-False Positive', 'Closed-SAR Filed')),
  investigation_notes text null,
  assigned_analyst varchar,
  resolved_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 16. audit_trail
create table audit_trail (
  id uuid primary key default uuid_generate_v4(),
  entity_type varchar check (entity_type in ('customer', 'lead', 'opportunity', 'case', 'credit', 'compliance')),
  entity_id uuid,
  action varchar check (action in ('CREATE', 'READ', 'UPDATE', 'DELETE')),
  changed_fields jsonb null,
  previous_values jsonb null,
  new_values jsonb null,
  performed_by varchar default 'system',
  ip_address varchar null,
  created_at timestamptz default now()
);

-- INDEXES
create index idx_indiv_parties_tier on individual_parties(tier);
create index idx_indiv_parties_lifecycle on individual_parties(lifecycle_stage);
create index idx_leads_status on leads(status);
create index idx_leads_rating on leads(lead_rating);
create index idx_opps_stage on opportunities(pipeline_stage);
create index idx_cases_status on service_cases(status);
create index idx_cases_priority on service_cases(priority);
create index idx_credit_status on credit_applications(status);
create index idx_aml_status on aml_alerts(status);
create index idx_audit_type on audit_trail(entity_type);
create index idx_audit_entity on audit_trail(entity_id);
create index idx_audit_created on audit_trail(created_at);

-- RLS Enable & Allow All
alter table individual_parties enable row level security;
alter table corporate_parties enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table product_catalog enable row level security;
alter table customer_products enable row level security;
alter table interactions enable row level security;
alter table account_balances enable row level security;
alter table transactions enable row level security;
alter table leads enable row level security;
alter table opportunities enable row level security;
alter table service_cases enable row level security;
alter table credit_applications enable row level security;
alter table kyc_records enable row level security;
alter table aml_alerts enable row level security;
alter table audit_trail enable row level security;

create policy "allow_all" on individual_parties for all using (true) with check (true);
create policy "allow_all" on corporate_parties for all using (true) with check (true);
create policy "allow_all" on households for all using (true) with check (true);
create policy "allow_all" on household_members for all using (true) with check (true);
create policy "allow_all" on product_catalog for all using (true) with check (true);
create policy "allow_all" on customer_products for all using (true) with check (true);
create policy "allow_all" on interactions for all using (true) with check (true);
create policy "allow_all" on account_balances for all using (true) with check (true);
create policy "allow_all" on transactions for all using (true) with check (true);
create policy "allow_all" on leads for all using (true) with check (true);
create policy "allow_all" on opportunities for all using (true) with check (true);
create policy "allow_all" on service_cases for all using (true) with check (true);
create policy "allow_all" on credit_applications for all using (true) with check (true);
create policy "allow_all" on kyc_records for all using (true) with check (true);
create policy "allow_all" on aml_alerts for all using (true) with check (true);
create policy "allow_all" on audit_trail for all using (true) with check (true);
