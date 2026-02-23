import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET() {
    try {
        const { data } = await insforge.database
            .from('marketing_analytics_daily')
            .select('day, channel, sent, suppressed')
            .order('day', { ascending: true });
        return NextResponse.json(data ?? []);
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
