import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;

        // If it's a UUID, it's the DB primary key. If it's CUST-*, it's the customer_id string.
        let query = insforge.database.from('individual_parties').select('*');

        if (id.includes('CUST-')) {
            query = query.eq('customer_id', id);
        } else {
            query = query.eq('id', id);
        }

        const { data, error } = await query.single();

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 404 });
        }

        return NextResponse.json({ data, meta: {} });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
