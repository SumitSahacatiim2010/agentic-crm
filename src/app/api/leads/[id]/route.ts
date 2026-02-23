import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;

        const { data, error } = await insforge.database
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 404 });
        }

        return NextResponse.json({ data, meta: {} });
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
