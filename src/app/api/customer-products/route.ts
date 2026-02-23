import { NextResponse } from 'next/server';
import { getInsforgeServer } from '@/lib/insforge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer_id, products } = body;

        // Mock updating customer products for the demo
        // In a real app we'd insert into customer_products or accounts.

        return NextResponse.json({ success: true, customer_id, products_added: products.length });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
