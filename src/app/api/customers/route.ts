import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitStr = searchParams.get('limit') || '50';
        const limit = parseInt(limitStr, 10);

        const search = searchParams.get('search');
        const persona = searchParams.get('persona');

        const db = (await getInsforgeServer()).database;

        // Fetch from individual_parties
        let query = db
            .from('individual_parties')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`full_legal_name.ilike.%${search}%,customer_id.ilike.%${search}%`);
        }

        if (persona) {
            if (persona.includes('retail_rm')) query = query.eq('assigned_rm', 'Sarah Jenkins');
            else if (persona.includes('corp_rm')) query = query.eq('assigned_rm', 'Michael Chang');
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 500 });
        }

        return NextResponse.json({
            data,
            meta: { total: count, limit, page: 1 }
        });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}

