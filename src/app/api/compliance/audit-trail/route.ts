import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const entity_name = sp.get('entity_name') || '';
        const actor = sp.get('actor') || '';
        const action_class = sp.get('action_class') || '';
        const domain = sp.get('domain') || '';
        const from = sp.get('from') || '';
        const to = sp.get('to') || '';
        const page = Math.max(0, parseInt(sp.get('page') ?? '0'));
        const limit = 25;

        let q = insforge.database.from('audit_logs')
            .select('event_id, entity_name, entity_id, action, changes, actor_persona, event_time, regulatory_domain, action_class, reason')
            .order('event_time', { ascending: false })
            .range(page * limit, page * limit + limit - 1);

        if (entity_name) q = q.eq('entity_name', entity_name);
        if (actor) q = q.eq('actor_persona', actor);
        if (action_class) q = q.eq('action_class', action_class);
        if (domain) q = q.eq('regulatory_domain', domain);
        if (from) q = q.gte('event_time', from);
        if (to) q = q.lte('event_time', to);

        const { data, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ rows: data ?? [], page, limit });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
