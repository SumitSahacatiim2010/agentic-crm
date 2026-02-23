// src/app/api/service-cases/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function POST(req: NextRequest) {
    try {
        const { customer_id, subject, description, priority } = await req.json();
        if (!subject) return NextResponse.json({ error: 'subject required' }, { status: 400 });
        const { error } = await insforge.database.from('service_cases').insert([{
            customer_id, subject, description, priority: priority || 'medium', status: 'open',
            sla_deadline: new Date(Date.now() + 3 * 86400 * 1000).toISOString()
        }]);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
