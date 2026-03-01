import { insforge as insforgeClient } from '@/lib/insforge-client';
import { BranchWorkspaceClient } from '@/components/branch/BranchWorkspaceClient';

export default async function BranchOperationsPage({ searchParams }: { searchParams: { persona?: string } }) {
    const persona = searchParams.persona || 'branch_teller';

    // Map persona to DB role
    let targetRole = 'BRANCH_TELLER';
    if (persona === 'branch_mgr') targetRole = 'BRANCH_MANAGER';
    else if (persona === 'retail_rm') targetRole = 'RM';

    const db = insforgeClient.database;

    // Find a staff user matching the role to simulate "logged in" context
    const { data: staffData } = await db.from('staff_users')
        .select('*, branches(name, code, id)')
        .eq('role', targetRole)
        .limit(1)
        .single();

    const staffUser = staffData || {
        id: 'mock-staff-id',
        name: 'Demo Teller',
        role: targetRole,
        branch_id: 'mock-branch-id',
        branches: { name: 'Downtown Main', code: 'BR-100' }
    };

    return (
        <BranchWorkspaceClient
            initialStaffUser={staffUser}
            branchName={staffUser.branches?.name || 'Branch'}
        />
    );
}
