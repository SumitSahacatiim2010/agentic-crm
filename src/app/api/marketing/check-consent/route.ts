import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET() {
    try {
        const { data } = await insforge.database.from('marketing_consent').select('do_not_contact, gdpr_opted_out, tcpa_restricted, email_marketing, sms_marketing, push_notifications');
        const rows = (data as any[]) ?? [];
        const total = rows.length;
        const dnc = rows.filter(r => r.do_not_contact).length;
        const gdpr = rows.filter(r => r.gdpr_opted_out).length;
        const tcpa = rows.filter(r => r.tcpa_restricted).length;
        const emailOut = rows.filter(r => !r.email_marketing).length;
        const smsOut = rows.filter(r => !r.sms_marketing).length;
        const pushOut = rows.filter(r => !r.push_notifications).length;
        const uniqueSuppressed = rows.filter(r => r.do_not_contact || r.gdpr_opted_out || r.tcpa_restricted || !r.email_marketing).length;
        const safe = total - uniqueSuppressed;
        return NextResponse.json({
            total_audience: total,
            dnc_matches: dnc,
            gdpr_opted_out: gdpr,
            tcpa_restricted: tcpa,
            email_opt_outs: emailOut,
            sms_opt_outs: smsOut,
            push_opt_outs: pushOut,
            safe_to_send: safe,
            suppression_pct: total > 0 ? Math.round((uniqueSuppressed / total) * 1000) / 10 : 0,
        });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
