import { NextRequest, NextResponse } from 'next/server';
import { submitCreditApplication } from '@/services/credit-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await submitCreditApplication(body);

        if (response.error) {
            const status = response.error.code === 'BAD_REQUEST' ? 400 : 500;
            return NextResponse.json({ error: response.error.message }, { status });
        }

        return NextResponse.json(response.data, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
