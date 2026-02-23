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
