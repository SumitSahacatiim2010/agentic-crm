import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';
import { computeBureauReport } from '@/lib/credit-scoring';

export async function POST(req: NextRequest) {
    try {
        const { application_id, applicant_name, business_name } = await req.json();
        if (!application_id || !applicant_name) return NextResponse.json({ error: 'application_id, applicant_name required' }, { status: 400 });

        const r = computeBureauReport(applicant_name, business_name);

        await insforge.database.from('credit_bureau_reports').insert([{
            application_id, fico_score: r.fico_score,
            delinquency_30_count: r.delinquency_30, delinquency_60_count: r.delinquency_60,
            delinquency_90_count: r.delinquency_90, public_records: r.public_records,
            bankruptcies: r.bankruptcies, trade_lines_open: r.trade_lines_open, on_time_pct: r.on_time_pct,
        }]);

        await insforge.database.from('credit_applications').update({ credit_score: r.fico_score }).eq('application_id', application_id);

        return NextResponse.json(r);
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
