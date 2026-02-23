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
