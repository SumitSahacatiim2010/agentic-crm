// src/app/api/service-cases/push-rm-alert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { case_id, customer_id, severity, title } = await req.json();
        if (!case_id || !severity || !title) {
            return NextResponse.json({ error: 'case_id, severity, and title required' }, { status: 400 });
        }
        if (!['High', 'Critical'].includes(severity)) {
            return NextResponse.json({ error: 'severity must be High or Critical' }, { status: 400 });
        }

        // Insert alert
        const { data, error } = await insforge.database.from('rm_alerts').insert([{
            case_id, customer_id: customer_id || null, severity, title, is_read: false
        }]).select('alert_id').limit(1);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Mark complaint as pushed
        await insforge.database.from('case_complaint_details')
            .update({ rm_alert_pushed: true })
            .eq('case_id', case_id);

        return NextResponse.json({ alert_id: data?.[0]?.alert_id, success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
