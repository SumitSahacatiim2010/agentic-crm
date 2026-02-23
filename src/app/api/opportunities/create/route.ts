// src/app/api/opportunities/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customer_id, title, pipeline_stage, projected_value, probability_weighting, expected_close_date, assigned_to } = body;

        if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

        const db = (await getInsforgeServer()).database;
        const { data, error } = await db.from('opportunities').insert([{
            customer_id: customer_id || null,
            deal_name: title,
            pipeline_stage: pipeline_stage || 'Prospecting',
            deal_value: projected_value || 0,
            probability: probability_weighting || 10,
            expected_close_date: expected_close_date || null,
            assigned_rm: assigned_to || null
        }]).select('id').limit(1);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ opportunity_id: data?.[0]?.id }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
