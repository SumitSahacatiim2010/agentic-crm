import { NextResponse } from 'next/server';
import { calculateCLV } from '@/lib/models/clv';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        if (!customerId) return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });

        const clvData = await calculateCLV(customerId);

        return NextResponse.json({
            data: clvData
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
