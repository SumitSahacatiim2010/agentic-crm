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
