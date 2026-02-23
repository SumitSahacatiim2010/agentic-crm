import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { writeAuditEntry } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const { application_id, action, notes } = await req.json();

        if (!application_id || !action) {
            return NextResponse.json({ error: 'application_id and action are required' }, { status: 400 });
        }

        // Action should be one of: 'Approve', 'Decline', 'Counter_Offer'
        let newStatus = '';
        if (action === 'Approve') newStatus = 'approved';
        else if (action === 'Decline') newStatus = 'declined';
        else if (action === 'Counter_Offer') newStatus = 'conditionally_approved';
        else return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });

        // Update application
        const { error: updateError } = await insforge.database.from('credit_applications').update({
            status: newStatus,
            decision: newStatus === 'conditionally_approved' ? 'refer' : newStatus === 'declined' ? 'decline' : 'approve',
            decision_at: new Date().toISOString()
        }).eq('application_id', application_id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Save Audit Trail
        await writeAuditEntry({
            entity_name: 'credit_applications',
            entity_id: application_id,
            action: `decision_${action.toLowerCase()}`,
            changes: { status: newStatus, notes },
            actor_persona: 'UNDERWRITER',
            regulatory_domain: 'CREDIT',
            action_class: 'UPDATE',
            reason: notes || `Underwriter marked application as ${action}`
        });

        return NextResponse.json({ success: true, status: newStatus });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
