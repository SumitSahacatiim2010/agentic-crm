"use server";

import { getInsforgeServer, insforge } from "./insforge";
import { MOCK_ALERTS } from "./rm-mock-data";

// ─── Customers ──────────────────────────────────────────────────────────────

export async function getCustomers() {
    try {
        const { data, error } = await insforge.database
            .from('parties')
            .select(`
                party_id,
                party_type,
                individual_parties (
                    full_legal_name,
                    segment_tier,
                    nationality,
                    employment_status
                )
            `)
            .limit(200);

        if (error) {
            console.error("Error fetching customers:", error);
            return [];
        }

        return data.map((p: any) => {
            const rawInd = p.individual_parties;
            const ind = Array.isArray(rawInd) ? rawInd[0] : rawInd;
            return {
                party_id: p.party_id,
                party_type: p.party_type,
                full_legal_name: ind?.full_legal_name || 'Unknown',
                segment_tier: ind?.segment_tier || 'Standard',
                nationality: ind?.nationality || 'N/A',
                employment_status: ind?.employment_status || 'N/A'
            };
        });
    } catch (e) {
        console.error("Failed to fetch customers:", e);
        return [];
    }
}

// ─── Portfolio Scorecard (P2.1) ──────────────────────────────────────────────
// Fixed: using correct column name 'stage' (not 'opportunity_stage')

const QUOTA_TARGET = 5_000_000; // $5M annual quota

export async function getPortfolioScorecardData() {
    const db = (await getInsforgeServer()).database;
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;

    const [wonRes, activeRes, closedRes, totalPartiesRes] = await Promise.all([
        db.from('opportunities').select('deal_value').eq('pipeline_stage', 'Completed').gte('updated_at', startOfYear),
        db.from('opportunities').select('deal_value, customer_id').not('pipeline_stage', 'in', '("Completed","Closed-Lost")'),
        db.from('opportunities').select('pipeline_stage').in('pipeline_stage', ['Completed', 'Closed-Lost']),
        db.from('individual_parties').select('id', { count: 'exact', head: true }),
    ]);

    const ytdRevenue = wonRes.data?.reduce((s: number, d: any) => s + Number(d.deal_value || 0), 0) || 0;
    const pipelineValue = activeRes.data?.reduce((s: number, d: any) => s + Number(d.deal_value || 0), 0) || 0;
    const activeCount = activeRes.data?.length || 0;
    const uniqueCustomers = new Set(activeRes.data?.map((d: any) => d.customer_id) || []).size;
    const wonCount = closedRes.data?.filter((d: any) => d.pipeline_stage === 'Completed').length || 0;
    const lostCount = closedRes.data?.filter((d: any) => d.pipeline_stage === 'Closed-Lost').length || 0;
    const winRate = (wonCount + lostCount) > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;
    const crossSellRatio = uniqueCustomers > 0 ? +(activeCount / uniqueCustomers).toFixed(2) : 0;
    const totalParties = totalPartiesRes.count || 1;
    const revenuePerCustomer = totalParties > 0 ? ytdRevenue / totalParties : 0;
    const quotaAttainment = (ytdRevenue / QUOTA_TARGET) * 100;

    return {
        metrics: [
            {
                label: 'Sales vs Quota',
                value: `$${(ytdRevenue / 1_000_000).toFixed(2)}M`,
                subValue: `${quotaAttainment.toFixed(0)}% of $${(QUOTA_TARGET / 1_000_000).toFixed(0)}M target`,
                trend: 'Up',
                status: quotaAttainment >= 90 ? 'Good' : quotaAttainment >= 70 ? 'Warning' : 'Critical',
                quotaTarget: QUOTA_TARGET,
                actual: ytdRevenue,
                attainmentPct: quotaAttainment,
            },
            {
                label: 'Cross-Sell Ratio',
                value: `${crossSellRatio}x`,
                subValue: `${activeCount} deals across ${uniqueCustomers} clients`,
                trend: crossSellRatio >= 2 ? 'Up' : 'Down',
                status: crossSellRatio >= 2 ? 'Good' : 'Warning',
                quotaTarget: 3,
                actual: crossSellRatio,
                attainmentPct: (crossSellRatio / 3) * 100,
            },
            {
                label: 'Revenue / Customer',
                value: `$${(revenuePerCustomer / 1000).toFixed(1)}k`,
                subValue: `Across ${totalParties.toLocaleString()} active parties`,
                trend: 'Up',
                status: 'Good',
                quotaTarget: 50000,
                actual: revenuePerCustomer,
                attainmentPct: (revenuePerCustomer / 50000) * 100,
            },
            {
                label: 'Win Rate',
                value: `${winRate.toFixed(0)}%`,
                subValue: `${wonCount}W / ${lostCount}L this year`,
                trend: winRate >= 50 ? 'Up' : 'Down',
                status: winRate >= 60 ? 'Good' : winRate >= 45 ? 'Warning' : 'Critical',
                quotaTarget: 70,
                actual: winRate,
                attainmentPct: (winRate / 70) * 100,
            }
        ],
        raw: { ytdRevenue, pipelineValue, activeCount, winRate, crossSellRatio }
    };
}

// Keep legacy function for backward compat
export async function getDashboardMetrics() {
    return getPortfolioScorecardData();
}

// ─── Pipeline Chart (P2.2) ───────────────────────────────────────────────────

export async function getPipelineChartData() {
    const { data } = await (await getInsforgeServer()).database
        .from('opportunities')
        .select('pipeline_stage, deal_value, updated_at');

    const stages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Completed', 'Closed-Lost'];
    const now = Date.now();
    const AGING_DAYS = 21;

    return stages.map(stage => {
        const stageDeals = data?.filter((d: any) => d.pipeline_stage === stage) || [];
        const value = stageDeals.reduce((sum: number, d: any) => sum + Number(d.deal_value || 0), 0);
        const agingCount = stageDeals.filter((d: any) => {
            if (!d.updated_at) return false;
            const daysSince = (now - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince > AGING_DAYS;
        }).length;

        return {
            stage,
            count: stageDeals.length,
            value,
            weightedValue: stageDeals.reduce((sum: number, d: any) => {
                const prob = stageProbabilityMap[stage] ?? 0.5;
                return sum + Number(d.deal_value || 0) * prob;
            }, 0),
            agingCount,
            fill: getStageColor(stage)
        };
    });
}

const stageProbabilityMap: Record<string, number> = {
    'Prospecting': 0.1, 'Qualification': 0.2, 'Needs Analysis': 0.4,
    'Proposal': 0.6, 'Negotiation': 0.8, 'Closed-Won': 1.0, 'Closed-Lost': 0.0
};

function getStageColor(stage: string) {
    const colors: Record<string, string> = {
        'Prospecting': '#94a3b8', 'Qualification': '#64748b', 'Needs Analysis': '#6366f1',
        'Proposal': '#3b82f6', 'Negotiation': '#f59e0b', 'Closed-Won': '#10b981', 'Closed-Lost': '#ef4444'
    };
    return colors[stage] || '#64748b';
}

// ─── Territory Analytics — Live DB (P2.2) ────────────────────────────────────

export async function getTerritoryBreakdownFromDB() {
    const db = (await getInsforgeServer()).database;
    const [indRes, oppsRes] = await Promise.all([
        db.from('individual_parties').select('id, tier'),
        db.from('opportunities').select('customer_id, pipeline_stage').not('pipeline_stage', 'in', '("Completed","Closed-Lost")'),
    ]);

    const individuals = indRes.data || [];
    const activeOpps = oppsRes.data || [];
    const tiers = ['Standard', 'Premium', 'HNW', 'UHNW'];
    const tierColors: Record<string, string> = {
        'Standard': '#64748b', 'Premium': '#6366f1', 'HNW': '#3b82f6', 'UHNW': '#10b981'
    };

    return tiers.map(tier => {
        const tierParties = individuals.filter((p: any) => p.tier === tier);
        const tierPartyIds = new Set(tierParties.map((p: any) => p.id));
        const tierOpps = activeOpps.filter((o: any) => tierPartyIds.has(o.customer_id));
        const penetration = tierParties.length > 0 ? Math.round((tierOpps.length / tierParties.length) * 100) : 0;
        const whitespace = Math.max(0, 100 - penetration);

        return {
            segment: tier,
            customers: tierParties.length,
            value: tierParties.length,
            penetration,
            whitespace,
            color: tierColors[tier],
            activeOpps: tierOpps.length,
        };
    });
}

// Keep legacy for backward compat
export async function getTerritoryMetrics() {
    return getTerritoryBreakdownFromDB();
}

// ─── Dashboard Tasks / Alerts ─────────────────────────────────────────────────

export async function getDashboardTasks() {
    const { data } = await (await getInsforgeServer()).database
        .from('service_cases')
        .select('id, subject, status, priority, sla_target_hours, customer_id')
        .in('status', ['Open', 'In-Progress', 'Escalated'])
        .limit(10);

    if (!data || data.length === 0) {
        return MOCK_ALERTS.map((a: any) => ({
            id: a.id, title: a.title, priority: a.priority, type: a.type,
            customer: 'Check Detail', due: a.due, description: a.description
        }));
    }

    return data.map((c: any) => ({
        id: c.id,
        title: c.subject || 'Service Case',
        priority: c.priority,
        type: 'Service',
        customer: 'Check Detail',
        due: c.sla_target_hours ? `${c.sla_target_hours}h target` : 'No SLA',
        description: `Status: ${c.status}`
    }));
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function getLeadsWithDetails() {
    const { data, error } = await (await getInsforgeServer()).database
        .from('leads')
        .select('*')
        .limit(100);

    if (error) console.error("Leads query error:", error);

    // Map to frontend expectations
    return (data || []).map((lead: any) => ({
        ...lead,
        lead_id: lead.id,
        full_legal_name: lead.full_name,
        lead_source: lead.source_channel,
        rating: lead.lead_rating,
        segment: lead.product_interest || 'General' // Using product_interest as segment for now
    }));
}

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function getOpportunitiesWithDetails() {
    const { data, error } = await (await getInsforgeServer()).database
        .from('opportunities')
        .select(`
            id,
            deal_name,
            pipeline_stage,
            deal_value,
            probability,
            expected_close_date,
            win_reason,
            loss_reason,
            created_at,
            updated_at,
            customer_id,
            individual_parties (
                full_name
            )
        `)
        .order('deal_value', { ascending: false });

    if (error) console.error("Opportunities query error:", error);

    return (data || []).map((o: any) => {
        const party = o.individual_parties;
        const ind = Array.isArray(party) ? party[0] : party;
        return {
            ...o,
            opportunity_id: o.id,
            opportunity_name: o.deal_name,
            opportunity_stage: o.pipeline_stage, // compat alias
            customer_name: ind?.full_name || 'Unknown Entity',
            probability_weighting: o.probability || 0,
            projected_value: o.deal_value,
            owner: 'RM Portfolio'
        };
    });
}

// ─── Customer 360 (Live) — separate queries per table to avoid SDK join issues ────

export async function getParty360(partyId: string) {
    const db = (await getInsforgeServer()).database;

    // 1. Core party row (Now querying individual_parties as root in Phase 3)
    const indRes = await db.from('individual_parties').select('*').eq('id', partyId).limit(1);

    if (indRes.error || !indRes.data || indRes.data.length === 0) {
        console.error('[getParty360] individual_party not found:', partyId, indRes.error);
        return null;
    }
    const ind = indRes.data[0] as any;

    // 2-8. Parallel subsidiary queries (Wait on these, adapt foreign keys)
    const [compRes, casesRes, oppsRes, intRes] = await Promise.all([
        db.from('compliance_profiles').select('kyc_status, kyc_last_review, aml_risk_rating, pep_status, fatca_crs_status').eq('party_id', partyId).limit(1),
        db.from('service_cases').select('id, subject, status, priority, sla_target_hours').eq('customer_id', partyId).limit(10),
        db.from('opportunities').select('id, deal_name, pipeline_stage, deal_value, probability, expected_close_date').eq('customer_id', partyId).limit(5),
        db.from('interactions').select('id, interaction_type, channel, summary, interaction_date').eq('customer_id', partyId).order('interaction_date', { ascending: false }).limit(20)
    ]);

    const compliance = compRes.data?.[0] as any || null;

    return {
        party: { party_id: ind.id, party_type: 'individual', status: ind.lifecycle_stage || 'active', created_at: ind.created_at },
        individual: {
            full_legal_name: ind.full_name,
            first_name: ind.full_name?.split(' ')[0] || '',
            last_name: ind.full_name?.split(' ').slice(1).join(' ') || '',
            date_of_birth: ind.date_of_birth,
            nationality: ind.nationality,
            employment_status: ind.employment_status,
            segment_tier: ind.tier
        },
        corporate: null, // Corporate handled separately in Phase 3 if needed
        compliance,
        relationships: [], // Not seeded in current My First Project -> Bankingcrm2.5 layout
        service_cases: casesRes.data || [],
        opportunities: oppsRes.data || [],
        interactions: intRes.data || [],
        displayName: ind.full_name || `Customer ${partyId.substring(0, 8)}`,
        segment_tier: ind.tier || 'N/A',
    };
}

export async function insertServiceCase(data: { customer_id: string; subject: string; description: string; priority: string }) {
    const { error } = await insforge.database.from('service_cases').insert([{
        customer_id: data.customer_id,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        status: 'open',
        sla_deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
    }]);
    return { success: !error, error };
}

// Prior-period baselines (seeded constants representing last year's figures)
const PRIOR_YEAR = { revenue: 480_000, margin: 27.2, avgClv: 38_000, churnRate: 3.8 };

// Fallback mock data when DB is unreachable or returns empty results
const FALLBACK_KPIS = {
    revenue: 575_036,   // ~$575K from 10 Completed deals (matches seeded data)
    margin: 14.2,       // revenue / total pipeline
    avgClv: 42_500,
    churnRate: 2.1,
    wonDealCount: 10,
    individualCount: 80,
};

export async function getExecKpis() {
    const db = insforge.database;

    // Revenue — count BOTH 'Completed' and 'Closed-Won' stages
    const { data: opps, error: oppsErr } = await db.from('opportunities').select('deal_value, pipeline_stage')
        .in('pipeline_stage', ['Completed', 'Closed-Won']);
    if (oppsErr) console.error('[getExecKpis] opps error:', oppsErr);

    const totalRevLive = opps?.reduce((sum: number, o: any) => sum + Number(o.deal_value || 0), 0) || 0;
    const wonCountLive = opps?.length || 0;

    // Pipeline value for margin proxy
    const { data: allOpps, error: pipeErr } = await db.from('opportunities').select('deal_value')
        .not('pipeline_stage', 'in', '("Closed-Lost")');
    if (pipeErr) console.error('[getExecKpis] pipeline error:', pipeErr);
    const totalPipelineLive = allOpps?.reduce((s: number, o: any) => s + Number(o.deal_value || 0), 0) || 0;

    // CLV and Churn
    const { data: ind, error: indErr } = await db.from('individual_parties').select('clv, lifecycle_stage');
    if (indErr) console.error('[getExecKpis] individuals error:', indErr);

    let sumClvLive = 0;
    let countIndLive = 0;
    let churnCountLive = 0;

    if (ind && ind.length > 0) {
        countIndLive = ind.length;
        ind.forEach((i: any) => {
            sumClvLive += Number(i.clv || 0);
            if (i.lifecycle_stage === 'Churned') churnCountLive++;
        });
    }

    // Determine if we have live data — use fallback if all queries returned empty
    const hasLiveData = wonCountLive > 0 || countIndLive > 0;

    const totalRev = hasLiveData ? totalRevLive : FALLBACK_KPIS.revenue;
    const totalPipeline = hasLiveData ? totalPipelineLive : FALLBACK_KPIS.revenue / 0.142; // derive from margin
    const countInd = hasLiveData ? countIndLive : FALLBACK_KPIS.individualCount;
    const sumClv = hasLiveData ? sumClvLive : FALLBACK_KPIS.avgClv * FALLBACK_KPIS.individualCount;
    const churnCount = hasLiveData ? churnCountLive : Math.round(FALLBACK_KPIS.churnRate / 100 * FALLBACK_KPIS.individualCount);
    const wonDealCount = hasLiveData ? wonCountLive : FALLBACK_KPIS.wonDealCount;

    // Computed metrics
    const margin = totalPipeline > 0 ? (totalRev / totalPipeline) * 100 : null;
    const avgClv = countInd > 0 ? sumClv / countInd : null;
    const churnRate = countInd > 0 ? (churnCount / countInd) * 100 : null;

    // YoY computation helper
    const yoy = (current: number | null, prior: number) => {
        if (current === null || prior === 0) return null;
        return +((current - prior) / prior * 100).toFixed(1);
    };

    return {
        revenue: totalRev,
        revenueYoY: yoy(totalRev, PRIOR_YEAR.revenue),
        margin: margin !== null ? +margin.toFixed(1) : null,
        marginYoY: yoy(margin, PRIOR_YEAR.margin),
        avgClv: avgClv !== null ? Math.round(avgClv) : null,
        avgClvYoY: yoy(avgClv, PRIOR_YEAR.avgClv),
        churnRate: churnRate !== null ? +churnRate.toFixed(1) : null,
        churnRateYoY: yoy(churnRate, PRIOR_YEAR.churnRate),
        // Raw counts for diagnostics
        wonDealCount,
        individualCount: countInd,
        _source: hasLiveData ? 'live' : 'fallback',
    };
}
