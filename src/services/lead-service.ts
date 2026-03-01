import { insforge as insforgeClient } from '@/lib/insforge-client';

export interface ServiceResponse<T> {
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: any;
}

export const ingestLead = async (body: any): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data, error } = await db
            .from('leads')
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

export const updateBANT = async (id: string, bantData: any): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data, error } = await db
            .from('leads')
            .update(bantData)
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

export const convertLeadToOpportunity = async (id: string): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;

        // 1. Get Lead
        const { data: lead, error: leadError } = await db
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        if (leadError || !lead) {
            return { error: { code: leadError?.code || 'NOT_FOUND', message: leadError?.message || 'Lead not found' } };
        }

        // 2. Create Opportunity
        const oppData = {
            customer_id: lead.converted_customer_id || null,
            deal_name: `${lead.product_interest || 'New'} — ${lead.full_name || 'Lead'}`,
            pipeline_stage: 'Qualification',
            deal_value: 0,
            probability: 20,
            assigned_rm: lead.assigned_rm || 'Unassigned',
            created_at: new Date().toISOString()
        };

        const { data: opp, error: oppError } = await db
            .from('opportunities')
            .insert([oppData])
            .select()
            .single();

        if (oppError) {
            return { error: { code: oppError.code, message: oppError.message } };
        }

        // 3. Update Lead Status
        await db
            .from('leads')
            .update({ status: 'Converted' })
            .eq('id', id);

        return { data: { lead, opportunity: opp } };

    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const getLeads = async (params: { limit?: number; page?: number; status?: string }): Promise<ServiceResponse<any[]>> => {
    try {
        const limit = params.limit || 50;
        const page = params.page || 1;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const db = insforgeClient.database;
        let query = db
            .from('leads')
            .select('*', { count: 'exact' });

        if (params.status) query = query.eq('status', params.status);

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        return {
            data,
            meta: { total: count, limit, page }
        };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const getLeadById = async (id: string): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data, error } = await db
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};
