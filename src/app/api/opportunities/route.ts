import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        const persona = searchParams.get('persona');
        const product_type = searchParams.get('product_type');

        const db = (await getInsforgeServer()).database;
        let query = db
            .from('opportunities')
            .select(`
                id,
                deal_name,
                pipeline_stage,
                deal_value,
                probability,
                expected_close_date,
                created_at,
                updated_at,
                assigned_rm,
                customer_id,
                individual_parties ( full_name )
            `, { count: 'exact' });

        const stage = searchParams.get('stage');
        if (stage) query = query.eq('pipeline_stage', stage);

        if (persona) {
            if (persona.includes('retail_rm')) query = query.eq('assigned_rm', 'Sarah Jenkins');
            else if (persona.includes('corp_rm')) query = query.eq('assigned_rm', 'Michael Chang');
        }

        if (product_type && product_type !== 'All') {
            if (product_type === 'Deposits') query = query.ilike('deal_name', '%Deposit%');
            else if (product_type === 'Lending') query = query.or('deal_name.ilike.%Loan%,deal_name.ilike.%Mortgage%,deal_name.ilike.%Line%,deal_name.ilike.%Refinance%');
            else if (product_type === 'Investments') query = query.or('deal_name.ilike.%Investment%,deal_name.ilike.%Wealth%,deal_name.ilike.%Portfolio%');
            else if (product_type === 'Cards') query = query.ilike('deal_name', '%Card%');
            else if (product_type === 'Insurance') query = query.ilike('deal_name', '%Insurance%');
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 500 });
        }

        const mappedData = data.map((o: any) => {
            const party = o.individual_parties;
            const ind = Array.isArray(party) ? party[0] : party;

            // Map Phase 3 schema to what frontend expects
            return {
                ...o,
                opportunity_id: o.id,
                title: o.deal_name,
                stage: o.pipeline_stage,
                projected_value: o.deal_value,
                assigned_to: o.assigned_rm,
                opportunity_name: o.deal_name,
                opportunity_stage: o.pipeline_stage,
                customer_name: ind?.full_name || 'Unknown Entity',
                probability_weighting: o.probability || 0,
                owner: o.assigned_rm || 'Unassigned'
            };
        });

        return NextResponse.json({
            data: mappedData,
            meta: { total: count, limit, page }
        });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}

