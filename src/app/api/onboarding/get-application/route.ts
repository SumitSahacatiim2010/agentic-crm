// GET /api/onboarding/get-application?token=<resume_token>
// Cross-device resume: hydrates wizard state from DB
import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const { data, error } = await insforge.database
        .from('onboarding_applications')
        .select('*')
        .eq('resume_token', token)
        .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || (data as any[]).length === 0) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json((data as any)[0]);
}
