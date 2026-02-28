import { getInsforgeServer } from '@/lib/insforge';
import { ServiceResponse } from './lead-service';

export const createOpportunity = async (body: any): Promise<ServiceResponse<any>> => {
    try {
        const db = (await getInsforgeServer()).database;
        const { data, error } = await db
            .from('opportunities')
            .insert([{ ...body, created_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const updateOpportunityStage = async (id: string, stage: string): Promise<ServiceResponse<any>> => {
    try {
        const db = (await getInsforgeServer()).database;
        const { data, error } = await db
            .from('opportunities')
            .update({ pipeline_stage: stage, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const getOpportunities = async (params: { limit?: number; page?: number; stage?: string; persona?: string; product_type?: string }): Promise<ServiceResponse<any[]>> => {
    try {
        const limit = params.limit || 50;
        const page = params.page || 1;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const db = (await getInsforgeServer()).database;
        let query = db
            .from('opportunities')
            .select(`
                id,
                deal_name,
                pipeline_stage,
                deal_value,
                probability,
                expected_close_date,
                created_at,
                updated_at,
                assigned_rm,
                customer_id,
                individual_parties ( full_name )
            `, { count: 'exact' });

        if (params.stage) query = query.eq('pipeline_stage', params.stage);

        if (params.persona) {
            if (params.persona.includes('retail_rm')) query = query.eq('assigned_rm', 'Sarah Jenkins');
            else if (params.persona.includes('corp_rm')) query = query.eq('assigned_rm', 'Michael Chang');
        }

        if (params.product_type && params.product_type !== 'All') {
            if (params.product_type === 'Deposits') query = query.ilike('deal_name', '%Deposit%');
            else if (params.product_type === 'Lending') query = query.or('deal_name.ilike.%Loan%,deal_name.ilike.%Mortgage%,deal_name.ilike.%Line%,deal_name.ilike.%Refinance%');
            else if (params.product_type === 'Investments') query = query.or('deal_name.ilike.%Investment%,deal_name.ilike.%Wealth%,deal_name.ilike.%Portfolio%');
            else if (params.product_type === 'Cards') query = query.ilike('deal_name', '%Card%');
            else if (params.product_type === 'Insurance') query = query.ilike('deal_name', '%Insurance%');
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        const mappedData = data.map((o: any) => {
            const party = o.individual_parties;
            const ind = Array.isArray(party) ? party[0] : party;

            return {
                ...o,
                opportunity_id: o.id,
                title: o.deal_name,
                stage: o.pipeline_stage,
                projected_value: o.deal_value,
                assigned_to: o.assigned_rm,
                opportunity_name: o.deal_name,
                opportunity_stage: o.pipeline_stage,
                customer_name: ind?.full_name || 'Unknown Entity',
                probability_weighting: o.probability || 0,
                owner: o.assigned_rm || 'Unassigned'
            };
        });

        return {
            data: mappedData,
            meta: { total: count, limit, page }
        };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};
