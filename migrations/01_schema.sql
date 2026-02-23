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
