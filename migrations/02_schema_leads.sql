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
