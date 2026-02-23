import { NextResponse } from 'next/server';
import { generateNBARecommendations } from '@/lib/nba/engine';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params;
        if (!customerId) return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });

        const recommendations = await generateNBARecommendations(customerId);

        return NextResponse.json({
            data: recommendations,
            meta: {
                customer_id: customerId,
                generated_at: new Date().toISOString(),
                model_version: 'rule-based-v1'
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
