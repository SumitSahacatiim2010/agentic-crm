import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let query = insforge.database
            .from('aml_alerts')
            .select('*, individual_parties(full_name, customer_id)', { count: 'exact' });

        const status = searchParams.get('status');
        if (status) query = query.eq('status', status);

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 500 });
        }

        return NextResponse.json({
            data,
            meta: { total: count, limit, page }
        });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
