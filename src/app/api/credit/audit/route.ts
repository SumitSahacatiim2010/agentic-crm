import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const entity_id = searchParams.get('entity_id');

        if (!entity_id) {
            return NextResponse.json({ error: 'entity_id query parameter is required' }, { status: 400 });
        }

        const { data, error } = await insforge.database
            .from('audit_trail')
            .select('*')
            .eq('entity_name', 'credit_applications')
            .eq('entity_id', entity_id)
            .order('timestamp', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
