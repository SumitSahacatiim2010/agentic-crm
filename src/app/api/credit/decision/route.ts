import { NextRequest, NextResponse } from 'next/server';
import { updateCreditDecision } from '@/services/credit-service';

export async function POST(req: NextRequest) {
    try {
        const { application_id, action, notes } = await req.json();

        const response = await updateCreditDecision(application_id, action, notes);

        if (response.error) {
            const status = response.error.code === 'BAD_REQUEST' ? 400 : 500;
            return NextResponse.json({ error: response.error.message }, { status });
        }

        return NextResponse.json(response.data);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
