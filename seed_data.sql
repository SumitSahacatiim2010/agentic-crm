
-- Seed Data for Alexander V. Sterling

-- 1. Insert Master Party
INSERT INTO parties (party_id, party_type)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'individual')
ON CONFLICT (party_id) DO NOTHING;

-- 2. Insert Individual Party Details
INSERT INTO individual_parties (customer_id, full_legal_name, segment_tier, nationality, employment_status, annual_income)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Alexander V. Sterling',
    'Platinum',
    'American',
    'Executive Director',
    1500000
)
ON CONFLICT (customer_id) DO NOTHING;

-- 3. Insert Financial Products
INSERT INTO financial_products (customer_id, product_type, product_name, current_balance, currency_code, account_status)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Checking', 'Premier Global Checking', 245000.50, 'USD', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Savings', 'High Yield Savings', 1250000.00, 'USD', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Investment', 'Global Equity Portfolio', 4850000.75, 'USD', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Credit Card', 'Infinite Reserve Card', -12450.00, 'USD', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mortgage', 'Hamptons Estate Loan', -2100000.00, 'USD', 'active');

-- 4. Insert Compliance Registry
INSERT INTO compliance_registry (customer_id, kyc_refresh_due_date, aml_risk_rating, pep_status_flag, fatca_classification, crs_tax_residency)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '2025-11-15',
    'Low',
    false,
    'Compliant',
    'Reportable (US)'
);

-- 5. Insert Sales Opportunity
INSERT INTO sales_opportunities (customer_id, opportunity_stage, projected_value, probability_weighting, expected_close_date)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Proposal',
    5000000,
    60,
    '2026-06-30'
);
