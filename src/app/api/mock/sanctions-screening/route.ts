import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || 'unknown';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simple deterministic mock logic based on ID substring
    let match = false;
    let nearMatch = false;

    if (customerId.includes('sanction')) {
        match = true;
    } else if (customerId.includes('pep')) {
        nearMatch = true;
    }

    return NextResponse.json({
        customer_id: customerId,
        sanctions_match: match,
        sanctions_near_match: nearMatch,
        screened_at: new Date().toISOString()
    });
}
