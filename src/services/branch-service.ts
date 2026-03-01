import { insforge as insforgeClient } from '@/lib/insforge-client';

export interface WorkItem {
    id: string;
    entityType: 'lead' | 'case' | 'task';
    title: string;
    subtitle: string;
    status: string;
    priority: string;
    ownerId: string | null;
    ownerName?: string;
    branchId: string;
    createdAt: string;
    slaDueAt: string | null;
    customerId?: string | null;
    customerName?: string | null;
    productInterest?: string | null;
}

export const getBranchWorkqueue = async (branchId: string, filterOwnerId?: string): Promise<{ data?: WorkItem[], error?: any }> => {
    try {
        const db = insforgeClient.database;
        const workItems: WorkItem[] = [];

        // 1. Fetch Leads
        let leadsQuery = db.from('leads').select('*, owner:staff_users(name)').eq('branch_id', branchId).neq('status', 'Closed');
        if (filterOwnerId) leadsQuery = leadsQuery.eq('owner_id', filterOwnerId);

        const { data: leads, error: leadsErr } = await leadsQuery;
        if (leadsErr) throw leadsErr;

        if (leads) {
            leads.forEach(l => {
                workItems.push({
                    id: l.id,
                    entityType: 'lead',
                    title: l.full_name || 'Unknown Lead',
                    subtitle: `Lead • ${l.source_channel || 'Direct'}`,
                    status: l.status,
                    priority: l.priority_flag ? 'High' : (l.lead_rating === 'Hot' ? 'Medium' : 'Low'),
                    ownerId: l.owner_id,
                    ownerName: l.owner?.name,
                    branchId: l.branch_id,
                    createdAt: l.created_at,
                    slaDueAt: l.sla_due_at,
                    productInterest: l.product_interest
                });
            });
        }

        // 2. Fetch Cases
        let casesQuery = db.from('service_cases').select('*, owner:staff_users(name), customer:individual_parties(full_name)').eq('branch_id', branchId).neq('status', 'Closed');
        if (filterOwnerId) casesQuery = casesQuery.eq('owner_id', filterOwnerId);

        const { data: cases, error: casesErr } = await casesQuery;
        if (casesErr) throw casesErr;

        if (cases) {
            cases.forEach(c => {
                workItems.push({
                    id: c.case_id,
                    entityType: 'case',
                    title: c.subject || `Case ${c.case_number}`,
                    subtitle: `Case • ${c.customer?.full_name || 'Unknown Customer'}`,
                    status: c.status,
                    priority: c.priority,
                    ownerId: c.owner_id,
                    ownerName: c.owner?.name,
                    branchId: c.branch_id,
                    createdAt: c.created_at,
                    slaDueAt: c.sla_due_at,
                    customerId: c.customer_id,
                    customerName: c.customer?.full_name
                });
            });
        }

        // 3. Fetch Tasks (Activities with entityType='task' related to this branch)
        // For simplicity, we assume tasks assigned to branch staff belong to the branch workqueue
        let staffQuery = db.from('staff_users').select('id').eq('branch_id', branchId);
        if (filterOwnerId) staffQuery = staffQuery.eq('id', filterOwnerId);
        const { data: branchStaff } = await staffQuery;

        if (branchStaff && branchStaff.length > 0) {
            const staffIds = branchStaff.map(s => s.id);
            const { data: tasks, error: tasksErr } = await db.from('activities').select('*, owner_user:staff_users(name)')
                .in('owner_id', staffIds)
                .neq('status', 'Completed');

            if (!tasksErr && tasks) {
                tasks.forEach(t => {
                    workItems.push({
                        id: t.id,
                        entityType: 'task',
                        title: t.subject || 'Task',
                        subtitle: `Task • ${t.activity_type || 'General'}`,
                        status: t.status,
                        priority: t.priority_band || 'Medium',
                        ownerId: t.owner_id,
                        ownerName: t.owner_user?.name,
                        branchId,
                        createdAt: t.created_at,
                        slaDueAt: t.due_date
                    });
                });
            }
        }

        // Sort by SLA/Created
        workItems.sort((a, b) => {
            const dateA = a.slaDueAt ? new Date(a.slaDueAt).getTime() : new Date(a.createdAt).getTime();
            const dateB = b.slaDueAt ? new Date(b.slaDueAt).getTime() : new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

        return { data: workItems };
    } catch (e: any) {
        return { error: { message: e.message } };
    }
};

export const getBranchStaff = async (branchId: string) => {
    try {
        const { data, error } = await insforgeClient.database.from('staff_users').select('*').eq('branch_id', branchId);
        if (error) throw error;
        return { data };
    } catch (e: any) {
        return { error: { message: e.message } };
    }
};

export const getBranchDetails = async (branchId: string) => {
    try {
        const { data, error } = await insforgeClient.database.from('branches').select('*').eq('id', branchId).single();
        if (error) throw error;
        return { data };
    } catch (e: any) {
        return { error: { message: e.message } };
    }
};
