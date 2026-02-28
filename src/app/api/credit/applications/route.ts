import { NextResponse } from 'next/server';
import { getCreditApplications } from '@/services/credit-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const status = searchParams.get('status') || undefined;

        const response = await getCreditApplications({ limit, page, status });

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (e: any) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
    }
}
