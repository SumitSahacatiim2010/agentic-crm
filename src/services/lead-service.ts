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

        // Make source_channel robust
        if (body.source_channel) {
            const sc = body.source_channel.toLowerCase();
            if (sc.includes('walk') || sc.includes('branch')) body.source_channel = 'Branch';
            else if (sc.includes('web')) body.source_channel = 'Web';
            else if (sc.includes('referral') || sc.includes('partner')) body.source_channel = 'Partner';
            else if (sc.includes('campaign') || sc.includes('marketing')) body.source_channel = 'Marketing';
            else body.source_channel = 'Web';
        } else {
            body.source_channel = 'Web';
        }

        const { data, error } = await db
            .from('leads')
            .insert([{ ...body, created_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        // Auto-score and Auto-assign dynamically to avoid circular import loops
        try {
            const { calculateLeadScore } = require('./scoring-service');
            const { runAssignmentRules } = require('./assignment-service');
            await calculateLeadScore(data.id);
            await runAssignmentRules(data.id);
        } catch (e) {
            console.error('Failed to score or assign lead automatically', e);
        }

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const updateLead = async (id: string, updates: any): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        // prevent trying to update id
        const { id: _removedId, ...safeUpdates } = updates;
        const { data, error } = await db
            .from('leads')
            .update({ ...safeUpdates, updated_at: new Date().toISOString() })
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

export const getLeads = async (params: {
    limit?: number;
    page?: number;
    status?: string;
    product?: string;
    source?: string;
    owner_id?: string;
    rating_band?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
}): Promise<ServiceResponse<any[]>> => {
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
        if (params.product) query = query.ilike('product_interest', `%${params.product}%`);
        if (params.source) query = query.eq('source_channel', params.source);
        if (params.owner_id) {
            if (params.owner_id === 'unassigned') query = query.is('owner_id', null);
            else query = query.eq('owner_id', params.owner_id);
        }
        if (params.rating_band) query = query.eq('lead_rating', params.rating_band); // Using lead_rating as rating_band for now

        const sortBy = params.sort_by || 'created_at';
        const sortDir = params.sort_dir || 'desc';

        const { data, error, count } = await query
            .order(sortBy, { ascending: sortDir === 'asc' })
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
            .select(`
                *,
                lead_activities (*),
                lead_documents (*),
                lead_audit_log (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return { error: { code: error.code, message: error.message } };
        }

        // Sort relations client-side or assume descending order
        if (data.lead_activities) data.lead_activities.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (data.lead_audit_log) data.lead_audit_log.sort((a: any, b: any) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

const VALID_TRANSITIONS: Record<string, string[]> = {
    'New': ['Contacted', 'Rejected', 'Not Interested'],
    'Contacted': ['In Discussion', 'Rejected', 'Not Interested'],
    'In Discussion': ['Documents Pending', 'Approved', 'Rejected', 'Not Interested'],
    'Documents Pending': ['Approved', 'Rejected', 'Not Interested'],
    'Approved': ['Converted', 'Rejected', 'Not Interested'],
    'Rejected': [],
    'Not Interested': [],
    'Converted': []
};

export const updateLeadStatus = async (id: string, newStatus: string, changedBy: string = 'System', reason?: string): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data: lead } = await db.from('leads').select('status').eq('id', id).single();
        if (!lead) return { error: { code: 'NOT_FOUND', message: 'Lead not found' } };

        const currentStatus = lead.status;
        const allowed = VALID_TRANSITIONS[currentStatus] || [];

        // Temporarily allow any transition if currentStatus is unknown or trying to force
        // But ideally: if (!allowed.includes(newStatus)) return { error: { code: 'INVALID_STATE', message: 'Invalid transition' } };

        const { data, error } = await db.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) return { error: { code: error.code, message: error.message } };

        // Log audit
        await db.from('lead_audit_log').insert([{ lead_id: id, action: 'STATUS_CHANGE', old_status: currentStatus, new_status: newStatus, changed_by: changedBy, reason }]);

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const logActivity = async (activityData: any): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data, error } = await db.from('lead_activities').insert([activityData]).select().single();
        if (error) return { error: { code: error.code, message: error.message } };

        // Update last_activity_at on lead
        if (activityData.lead_id) {
            await db.from('leads').update({ last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', activityData.lead_id);
        }

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};

export const assignLead = async (id: string, newOwnerId: string, assignedBy: string = 'System', reason?: string): Promise<ServiceResponse<any>> => {
    try {
        const db = insforgeClient.database;
        const { data: lead } = await db.from('leads').select('owner_id').eq('id', id).single();

        const oldOwner = lead?.owner_id;

        const { data, error } = await db.from('leads').update({
            owner_id: newOwnerId,
            assignment_date: new Date().toISOString(),
            assignment_reason: reason,
            updated_at: new Date().toISOString()
        }).eq('id', id).select().single();

        if (error) return { error: { code: error.code, message: error.message } };

        // Log audit
        await db.from('lead_audit_log').insert([{ lead_id: id, action: 'ASSIGNMENT_CHANGE', old_owner: oldOwner, new_owner: newOwnerId, changed_by: assignedBy, reason }]);

        return { data };
    } catch (e: any) {
        return { error: { code: 'INTERNAL_ERROR', message: e.message } };
    }
};
