import { NextResponse } from 'next/server';
import { getLeads, ingestLead } from '@/services/lead-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const status = searchParams.get('status') || undefined;
        const product = searchParams.get('product') || undefined;
        const source = searchParams.get('source') || undefined;
        const owner_id = searchParams.get('owner_id') || undefined;
        const rating_band = searchParams.get('rating_band') || undefined;
        const sort_by = searchParams.get('sort_by') || undefined;
        const sort_dir_param = searchParams.get('sort_dir');
        const sort_dir = (sort_dir_param === 'asc' || sort_dir_param === 'desc') ? sort_dir_param : undefined;

        const response = await getLeads({
            limit, page, status, product, source, owner_id, rating_band, sort_by, sort_dir
        });

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await ingestLead(body);

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
